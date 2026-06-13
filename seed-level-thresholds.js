const { Client } = require('pg');

const client = new Client({
  host: '168.107.26.152',
  port: 5432,
  user: 'moveit',
  password: 'jsstudy15th',
  database: 'moveit',
});

// level_xp 임계값을 levels 테이블로 이관합니다.
//  - 비파괴/멱등: 컬럼은 IF NOT EXISTS 로 추가, 행은 upsert(없으면 추가/있으면 임계값만 수정).
//  - 기존 levelTitle 은 절대 덮어쓰지 않습니다(ON CONFLICT 시 minXp/maxXp 만 갱신).
const BANDS = [
  { id: 1, title: '쑥쑥 자라는 댄스신동', minXp: 0, maxXp: 10 }, // 0~9
  { id: 2, title: '리듬을 깨우친 댄스 유망주', minXp: 10, maxXp: 30 }, // 10~29
  { id: 3, title: '무대를 장악하는 댄스 스타', minXp: 30, maxXp: 50 }, // 30~49
  { id: 4, title: '전설의 댄스 마스터', minXp: 50, maxXp: null }, // 50~
];

async function run() {
  try {
    await client.connect();
    console.log('DB 연결됨');

    // 1) 임계값 컬럼 추가 (이미 있으면 그대로 둠)
    await client.query(
      'ALTER TABLE levels ADD COLUMN IF NOT EXISTS "minXp" integer NOT NULL DEFAULT 0',
    );
    await client.query(
      'ALTER TABLE levels ADD COLUMN IF NOT EXISTS "maxXp" integer',
    );
    console.log('✓ minXp / maxXp 컬럼 확인/추가');

    // 2) 밴드 임계값 upsert (타이틀은 보존)
    for (const b of BANDS) {
      await client.query(
        `INSERT INTO levels (id, "levelTitle", "minXp", "maxXp")
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE
           SET "minXp" = EXCLUDED."minXp",
               "maxXp" = EXCLUDED."maxXp"`,
        [b.id, b.title, b.minXp, b.maxXp],
      );
      console.log(
        `✓ Level ${b.id}: minXp=${b.minXp}, maxXp=${b.maxXp ?? 'NULL'}`,
      );
    }

    // 3) 결과 확인
    const res = await client.query(
      'SELECT id, "levelTitle", "minXp", "maxXp" FROM levels ORDER BY id',
    );
    console.log('현재 levels:', res.rows);
    console.log('✓ 완료!');
  } catch (error) {
    console.error('에러:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
