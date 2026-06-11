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

  static evaluate(targetPose: any[], userPose: any[]) {
    const frameCount = Math.min(targetPose.length, userPose.length);
    if (frameCount < 2) {
      return { rhythm: 0, accuracy: 0, expression: 0 };
    }

    let totalAccuracyScore = 0;
    let totalRhythmScore = 0;
    let targetTotalExtension = 0;
    let userTotalExtension = 0;

    for (let i = 0; i < frameCount; i++) {
      const targetFrame = targetPose[i];
      const userFrame = userPose[i];

      const frameAccuracy = this.calculateFrameAccuracy(targetFrame, userFrame);
      totalAccuracyScore += frameAccuracy;

      targetTotalExtension += this.calculateExtension(targetFrame);
      userTotalExtension += this.calculateExtension(userFrame);

      if (i > 0) {
        const targetPrev = targetPose[i - 1];
        const userPrev = userPose[i - 1];
        const rhythmMatch = this.calculateVelocityMatch(targetPrev, targetFrame, userPrev, userFrame);
        totalRhythmScore += rhythmMatch;
      }
    }

    // calculate raw percentages (0 ~ 100)
    let accuracyScore = (totalAccuracyScore / frameCount) * 100;
    let rhythmScore = (totalRhythmScore / (frameCount - 1)) * 100;
    let expressionRatio = userTotalExtension / (targetTotalExtension || 1);
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

  private static calculateFrameAccuracy(tFrame: any, uFrame: any): number {
    // 프레임 형식: { t, l: [33개 랜드마크] }
    const tl = tFrame?.l;
    const ul = uFrame?.l;
    if (!tl || !ul || tl.length < 33 || ul.length < 33) return 0;

    let distanceSum = 0;
    for (const idx of this.KEY_POINTS) {
      // Sometimes missing property
      const t = tl[idx];
      const u = ul[idx];
      if (!t || !u) continue;

      const dx = t.x - u.x;
      const dy = t.y - u.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      distanceSum += dist;
    }

    const avgDist = distanceSum / this.KEY_POINTS.length;
    // 0.3 avg distance per joint is large on normalized screen space.
    // Score tends to 1 as avgDist tends to 0
    return Math.max(0, 1 - (avgDist * 2));
  }

  private static calculateExtension(frame: any): number {
    const fl = frame?.l;
    if (!fl || fl.length < 33) return 0;

    const hipLeft = fl[23];
    const hipRight = fl[24];
    if (!hipLeft || !hipRight) return 0;

    const midHipX = (hipLeft.x + hipRight.x) / 2;
    const midHipY = (hipLeft.y + hipRight.y) / 2;

    let ext = 0;
    for (const idx of [15, 16, 27, 28]) { // extremities
      if (!fl[idx]) continue;
      const dx = fl[idx].x - midHipX;
      const dy = fl[idx].y - midHipY;
      ext += Math.sqrt(dx * dx + dy * dy);
    }
    return ext;
  }

  private static calculateVelocityMatch(tPrev: any, tCurr: any, uPrev: any, uCurr: any): number {
    const tp = tPrev?.l;
    const tc = tCurr?.l;
    const up = uPrev?.l;
    const uc = uCurr?.l;
    if (!tp || !tc || !up || !uc) return 0;

    let velMatchSum = 0;
    for (const idx of this.KEY_POINTS) {
      if (!tp[idx] || !tc[idx] || !up[idx] || !uc[idx]) continue;

      const tVx = tc[idx].x - tp[idx].x;
      const tVy = tc[idx].y - tp[idx].y;
      const tMag = Math.sqrt(tVx * tVx + tVy * tVy);

      const uVx = uc[idx].x - up[idx].x;
      const uVy = uc[idx].y - up[idx].y;
      const uMag = Math.sqrt(uVx * uVx + uVy * uVy);

      const diff = Math.abs(tMag - uMag);
      // High difference -> low score
      velMatchSum += Math.max(0, 1 - (diff * 5));
    }

    return velMatchSum / this.KEY_POINTS.length;
  }

  private static normalizeScore(raw: number, minCap: number, maxCap: number, boost: number): number {
    if (isNaN(raw)) return minCap;
    const boosted = raw * boost;
    return Math.min(maxCap, Math.max(minCap, boosted));
  }
}
