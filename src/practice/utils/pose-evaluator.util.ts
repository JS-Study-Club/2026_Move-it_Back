type Landmark = { x: number; y: number; z?: number; v?: number };
type RawFrame = { t?: number; l?: Landmark[] };

// 몸통 기준 좌표계로 정규화된 프레임.
// points 는 KEY_POINTS 순서이며, 단위는 "몸통 길이" — 화면상 크기(카메라 거리)와 무관해집니다.
type NormalizedFrame = {
  time: number;
  points: ({ x: number; y: number } | null)[];
  extension: number;
};

type Pair = { target: NormalizedFrame; user: NormalizedFrame };

export class PoseEvaluator {
  // MediaPipe Pose Landmarker Key Points Indices
  static readonly KEY_POINTS = [
    11, 12, // Shoulders
    13, 14, // Elbows
    15, 16, // Wrists
    23, 24, // Hips
    25, 26, // Knees
    27, 28, // Ankles
  ];

  // 전면 카메라 미러링 보정용 좌우 랜드마크 쌍
  private static readonly MIRROR_MAP: Record<number, number> = {
    11: 12, 12: 11,
    13: 14, 14: 13,
    15: 16, 16: 15,
    23: 24, 24: 23,
    25: 26, 26: 25,
    27: 28, 28: 27,
  };

  private static readonly VISIBILITY_MIN = 0.3; // 이보다 낮은 관절은 비교에서 제외
  private static readonly MIN_VALID_POINTS = 6; // 프레임당 최소 비교 가능 관절 수
  private static readonly MATCH_TOLERANCE = 0.25; // 초 — 프레임 매칭 허용 시간 오차
  private static readonly DEFAULT_FPS = 10; // 타임스탬프가 없을 때의 폴백 fps
  // 시작 싱크가 어긋나도 맞춰볼 전역 오프셋 후보: -0.3s ~ +0.3s
  // (카운트다운 후 녹화가 시작되므로 실제 지연은 이 범위 안. 더 넓히면
  //  반박자씩 틀린 춤까지 용서하게 되어 리듬 평가가 무력화됩니다)
  private static readonly SYNC_OFFSETS = Array.from(
    { length: 7 },
    (_, i) => (i - 3) * 0.1,
  );

  static evaluate(targetPose: any[], userPose: any[]) {
    if (!Array.isArray(targetPose) || !Array.isArray(userPose)) {
      return { rhythm: 0, accuracy: 0, expression: 0 };
    }

    // 양쪽 모두 몸통 기준 좌표계로 정규화 + 시작 시각을 0으로 재기준
    const target = this.normalizeSequence(targetPose, false);
    const userNormal = this.normalizeSequence(userPose, false);
    const userMirror = this.normalizeSequence(userPose, true);

    if (target.length < 2 || userNormal.length < 2) {
      return { rhythm: 0, accuracy: 0, expression: 0 };
    }

    // 싱크 오프셋 × 거울 여부 조합 중 정확도가 가장 높은 정렬을 채택
    let best = this.findBestAlignment(target, [userNormal, userMirror]);

    // 타임스탬프가 비정상이라 매칭이 전혀 안 되면 인덱스 기반으로 폴백
    if (best.pairs.length < 2) {
      const n = Math.min(target.length, userNormal.length);
      const pairs: Pair[] = [];
      for (let i = 0; i < n; i++) {
        pairs.push({ target: target[i], user: userNormal[i] });
      }
      best = this.scorePairs(pairs);
      if (best.pairs.length < 2) {
        return { rhythm: 0, accuracy: 0, expression: 0 };
      }
    }

    const { pairs, accuracyMean } = best;

    // 리듬: 시간 정렬된 인접 프레임 간 "초당 속도"를 비교 (fps 차이에도 안정)
    let rhythmSum = 0;
    let rhythmCount = 0;
    for (let i = 1; i < pairs.length; i++) {
      const match = this.velocityMatch(pairs[i - 1], pairs[i]);
      if (match !== null) {
        rhythmSum += match;
        rhythmCount++;
      }
    }

    // 표현력 = 자세 개방도(50%) + 움직임 에너지(50%) 의 타깃 대비 비율.
    // 둘 다 몸통 길이 단위라 카메라 거리(크기)와 무관하고,
    // 팔만 뻗고 가만히 서 있는 경우 움직임 에너지에서 깎입니다.
    let targetExtension = 0;
    let userExtension = 0;
    for (const pair of pairs) {
      targetExtension += pair.target.extension;
      userExtension += pair.user.extension;
    }
    const targetSpeed = this.avgExtremitySpeed(pairs.map((p) => p.target));
    const userSpeed = this.avgExtremitySpeed(pairs.map((p) => p.user));

    const extensionRatio = Math.min(1.5, userExtension / (targetExtension || 1));
    const speedRatio =
      targetSpeed > 0.05 ? Math.min(1.5, userSpeed / targetSpeed) : 1;
    const expressionRatio = extensionRatio * 0.5 + speedRatio * 0.5;

    // calculate raw percentages (0 ~ 100)
    let accuracyScore = accuracyMean * 100;
    let rhythmScore = rhythmCount > 0 ? (rhythmSum / rhythmCount) * 100 : 0;
    let expressionScore = Math.min(100, Math.max(0, expressionRatio * 100));

    // Tuned heuristics to produce realistic output bounds (min 40, max 100)
    accuracyScore = this.normalizeScore(accuracyScore, 50, 100, 1.2);
    rhythmScore = this.normalizeScore(rhythmScore, 50, 100, 1.3);
    expressionScore = this.normalizeScore(expressionScore, 40, 100, 1.0);

    return {
      rhythm: Math.round(rhythmScore),
      accuracy: Math.round(accuracyScore),
      expression: Math.round(expressionScore),
    };
  }

  // ─── 정규화 ─────────────────────────────────────────────────

  private static normalizeSequence(
    frames: RawFrame[],
    mirror: boolean,
  ): NormalizedFrame[] {
    const out: NormalizedFrame[] = [];
    let baseTime: number | null = null;

    for (let i = 0; i < frames.length; i++) {
      const rawTime = frames[i]?.t;
      const time = Number.isFinite(rawTime)
        ? (rawTime as number)
        : i / this.DEFAULT_FPS;

      const normalized = this.normalizeFrame(frames[i], mirror, time);
      if (!normalized) continue;

      if (baseTime === null) baseTime = normalized.time;
      normalized.time -= baseTime;
      out.push(normalized);
    }
    return out;
  }

  private static normalizeFrame(
    frame: RawFrame,
    mirror: boolean,
    time: number,
  ): NormalizedFrame | null {
    const l = frame?.l;
    if (!l || l.length < 33) return null;

    const leftShoulder = l[11];
    const rightShoulder = l[12];
    const leftHip = l[23];
    const rightHip = l[24];
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

    const midHipX = (leftHip.x + rightHip.x) / 2;
    const midHipY = (leftHip.y + rightHip.y) / 2;
    const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

    // 몸통 길이(어깨 중점~엉덩이 중점)를 기준 단위로 사용해
    // 화면상 인물 크기(카메라 거리) 차이를 제거합니다.
    const torso = Math.hypot(midShoulderX - midHipX, midShoulderY - midHipY);
    if (torso < 1e-4) return null;

    const points = this.KEY_POINTS.map((idx) => {
      const srcIdx = mirror ? this.MIRROR_MAP[idx] : idx;
      const p = l[srcIdx];
      if (!p) return null;
      if (p.v !== undefined && p.v < this.VISIBILITY_MIN) return null;

      const x = ((p.x - midHipX) / torso) * (mirror ? -1 : 1);
      const y = (p.y - midHipY) / torso;
      return { x, y };
    });

    let extension = 0;
    for (const idx of [15, 16, 27, 28]) {
      // extremities
      const p = points[this.KEY_POINTS.indexOf(idx)];
      if (p) extension += Math.hypot(p.x, p.y);
    }

    return { time, points, extension };
  }

  // ─── 시간 정렬 ───────────────────────────────────────────────

  private static findBestAlignment(
    target: NormalizedFrame[],
    userVariants: NormalizedFrame[][],
  ) {
    let best = { pairs: [] as Pair[], accuracyMean: -1 };

    for (const user of userVariants) {
      if (user.length < 2) continue;
      for (const offset of this.SYNC_OFFSETS) {
        const pairs = this.matchPairs(target, user, offset);
        if (pairs.length < 2) continue;
        const scored = this.scorePairs(pairs);
        if (scored.accuracyMean > best.accuracyMean) best = scored;
      }
    }
    return best;
  }

  // 각 유저 프레임을 (시간 + 오프셋)이 가장 가까운 타깃 프레임과 짝지음
  private static matchPairs(
    target: NormalizedFrame[],
    user: NormalizedFrame[],
    offset: number,
  ): Pair[] {
    const pairs: Pair[] = [];
    let ti = 0;

    for (const u of user) {
      const t = u.time + offset;
      while (
        ti < target.length - 1 &&
        Math.abs(target[ti + 1].time - t) <= Math.abs(target[ti].time - t)
      ) {
        ti++;
      }
      if (Math.abs(target[ti].time - t) <= this.MATCH_TOLERANCE) {
        pairs.push({ target: target[ti], user: u });
      }
    }
    return pairs;
  }

  private static scorePairs(pairs: Pair[]) {
    let sum = 0;
    let count = 0;
    const valid: Pair[] = [];

    for (const pair of pairs) {
      const acc = this.frameAccuracy(pair.target, pair.user);
      if (acc === null) continue;
      sum += acc;
      count++;
      valid.push(pair);
    }

    return {
      pairs: valid,
      accuracyMean: count > 0 ? sum / count : -1,
    };
  }

  // ─── 프레임 단위 점수 ────────────────────────────────────────

  private static frameAccuracy(
    target: NormalizedFrame,
    user: NormalizedFrame,
  ): number | null {
    let distanceSum = 0;
    let count = 0;

    for (let k = 0; k < this.KEY_POINTS.length; k++) {
      const t = target.points[k];
      const u = user.points[k];
      if (!t || !u) continue;
      distanceSum += Math.hypot(t.x - u.x, t.y - u.y);
      count++;
    }

    // 관절 절반 이상이 가려진 프레임은 비교에서 제외
    if (count < this.MIN_VALID_POINTS) return null;

    const avgDist = distanceSum / count;
    // 몸통 길이 단위 거리: 0 → 일치(1점), 평균 1몸통 길이 이상 어긋나면 0점.
    // (크기 정규화로 카메라 거리 노이즈가 제거되었으므로 이전보다 엄격하게 둡니다)
    return Math.max(0, 1 - avgDist);
  }

  private static velocityMatch(prev: Pair, curr: Pair): number | null {
    const dtTarget = curr.target.time - prev.target.time;
    const dtUser = curr.user.time - prev.user.time;
    if (dtTarget < 0.02 || dtUser < 0.02) return null;

    let weightedSum = 0;
    let weightTotal = 0;

    for (let k = 0; k < this.KEY_POINTS.length; k++) {
      const tp = prev.target.points[k];
      const tc = curr.target.points[k];
      const up = prev.user.points[k];
      const uc = curr.user.points[k];
      if (!tp || !tc || !up || !uc) continue;

      // 몸통 길이/초 단위 속도 — fps 가 달라도 동일 기준으로 비교됩니다.
      const tMag = Math.hypot(tc.x - tp.x, tc.y - tp.y) / dtTarget;
      const uMag = Math.hypot(uc.x - up.x, uc.y - up.y) / dtUser;

      // 상대 오차 기반 매칭. 정지 구간에서 노이즈가 점수를 지배하지 않도록 floor 를 둡니다.
      const denom = Math.max(tMag, uMag, 0.8);
      const match = Math.max(0, 1 - Math.abs(tMag - uMag) / denom);

      // 안무가 실제로 움직이는 관절일수록 가중치를 높게.
      // (안 움직이는 관절끼리 일치한다고 가만히 서 있는 춤이 높은 점수를 받으면 안 됩니다)
      const weight = Math.max(tMag, 0.2);
      weightedSum += match * weight;
      weightTotal += weight;
    }

    return weightTotal > 0 ? weightedSum / weightTotal : null;
  }

  // 손목/발목의 평균 이동 속도(몸통 길이/초) — 움직임 에너지 지표
  private static avgExtremitySpeed(frames: NormalizedFrame[]): number {
    const extremityKeys = [15, 16, 27, 28].map((idx) =>
      this.KEY_POINTS.indexOf(idx),
    );

    let sum = 0;
    let count = 0;

    for (let i = 1; i < frames.length; i++) {
      const dt = frames[i].time - frames[i - 1].time;
      if (dt < 0.02) continue;

      for (const k of extremityKeys) {
        const a = frames[i - 1].points[k];
        const b = frames[i].points[k];
        if (!a || !b) continue;
        sum += Math.hypot(b.x - a.x, b.y - a.y) / dt;
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }

  private static normalizeScore(
    raw: number,
    minCap: number,
    maxCap: number,
    boost: number,
  ): number {
    if (isNaN(raw)) return minCap;
    const boosted = raw * boost;
    return Math.min(maxCap, Math.max(minCap, boosted));
  }
}
