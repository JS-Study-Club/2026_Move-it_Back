const { Client } = require('pg');

const client = new Client({
  host: '168.107.26.152',
  port: 5432,
  user: 'moveit',
  password: 'jsstudy15th',
  database: 'moveit',
});

async function run() {
  try {
    await client.connect();
    console.log('DB 연결됨');

    // 모든 사용자의 레벨을 리셋
    const result = await client.query(
      'UPDATE users SET level = 1, level_xp = 0 RETURNING id, user_id, level, level_xp',
    );

    console.log(`✓ ${result.rowCount}명 사용자 리셋:`);
    console.log(`  level = 1, level_xp = 0`);

    // 확인
    const count = await client.query(
      "SELECT COUNT(*)::int AS total, COUNT(CASE WHEN level = 1 AND level_xp = 0 THEN 1 END)::int AS reset FROM users",
    );
    console.log(`\n✓ 완료!`);
    console.log(`  총 사용자: ${count.rows[0].total}`);
    console.log(`  리셋된 사용자: ${count.rows[0].reset}`);
  } catch (error) {
    console.error('에러:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

run();
