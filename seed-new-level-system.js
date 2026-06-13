const { Client } = require('pg');

const client = new Client({
  host: '168.107.26.152',
  port: 5432,
  user: 'moveit',
  password: 'jsstudy15th',
  database: 'moveit',
});

// 칭호 정의
const TIERS = {
  '쑥쑥 자라는 댄스신동': [1, 9],
  '리듬을 깨우친 댄스 유망주': [10, 29],
  '무대를 장악하는 댄스 스타': [30, 49],
  '전설의 댄스 마스터': [50, Infinity],
};

function getTierName(level) {
  for (const [tier, [min, max]] of Object.entries(TIERS)) {
    if (level >= min && level <= max) return tier;
  }
  return '전설의 댄스 마스터';
}

// 레벨별 필요 xp 계산: 1~5→5, 6~10→10, 11~15→15, ...
function getXpRequired(level) {
  const band = Math.floor((level - 1) / 5) + 1;
  return band * 5;
}

async function run() {
  try {
    await client.connect();
    console.log('DB 연결됨');

    // 모든 기존 행 삭제 (비파괴 아님 주의: 기존 4행만 새 1~99로 교체)
    const beforeCount = await client.query('SELECT COUNT(*)::int AS cnt FROM levels');
    console.log(`기존 levels 행: ${beforeCount.rows[0].cnt}`);

    // 1~99 레벨 생성/업데이트
    for (let level = 1; level <= 99; level++) {
      const tierName = getTierName(level);
      const xpRequired = getXpRequired(level);

      await client.query(
        `INSERT INTO levels (id, "tierName", "xpRequired")
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE
           SET "tierName" = EXCLUDED."tierName",
               "xpRequired" = EXCLUDED."xpRequired"`,
        [level, tierName, xpRequired],
      );

      if (level % 10 === 0 || level === 1) {
        console.log(
          `✓ Level ${level}: "${tierName}", xpRequired=${xpRequired}`,
        );
      }
    }

    // 100 이상의 행 삭제 (있으면)
    await client.query('DELETE FROM levels WHERE id > 99');

    // 확인
    const res = await client.query(
      `SELECT id, "tierName", "xpRequired" FROM levels
       WHERE id IN (1, 5, 9, 10, 15, 29, 30, 35, 49, 50, 55, 99)
       ORDER BY id`,
    );
    console.log('\n샘플 레벨:');
    res.rows.forEach((r) => {
      console.log(
        `  ID ${r.id}: "${r.tierName}", xpRequired=${r.xpRequired}`,
      );
    });

    const count = await client.query(
      'SELECT COUNT(*)::int AS cnt FROM levels',
    );
    console.log(`\n✓ 완료! 총 ${count.rows[0].cnt}개 레벨`);
  } catch (error) {
    console.error('에러:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
