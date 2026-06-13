// 레벨(1~) → 칭호 계산.
// 레벨 범위와 칭호:
//  - 1~9: "쑥쑥 자라는 댄스신동"
//  - 10~29: "리듬을 깨우친 댄스 유망주"
//  - 30~49: "무대를 장악하는 댄스 스타"
//  - 50~: "전설의 댄스 마스터"

const TIER_DEFINITIONS = [
  { minLevel: 1, maxLevel: 9, name: '쑥쑥 자라는 댄스신동' },
  { minLevel: 10, maxLevel: 29, name: '리듬을 깨우친 댄스 유망주' },
  { minLevel: 30, maxLevel: 49, name: '무대를 장악하는 댄스 스타' },
  { minLevel: 50, maxLevel: Infinity, name: '전설의 댄스 마스터' },
];

export function getTierName(level: number): string {
  const tier = TIER_DEFINITIONS.find(
    (t) => level >= t.minLevel && level <= t.maxLevel,
  );
  return tier?.name ?? '전설의 댄스 마스터';
}

// 레벨별 다음 레벨 도달에 필요한 xp 계산.
// 공식: 레벨 1~5 → 5, 6~10 → 10, 11~15 → 15, ...
//       ((level - 1) // 5 + 1) * 5
export function getXpRequired(level: number): number {
  const band = Math.floor((level - 1) / 5) + 1;
  return band * 5;
}
