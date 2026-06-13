const { Client } = require('pg');

const client = new Client({
  host: '168.107.26.152',
  port: 5432,
  user: 'moveit',
  password: 'jsstudy15th',
  database: 'moveit',
});

// 잉여 레벨 행(id=5 '마스터')을 제거합니다.
//  - users.level_id 가 levels.id 를 FK 로 참조하므로, id=5 를 참조하는 user 가 있으면
//    FK 위반으로 삭제가 실패합니다. 참조가 있으면 유효한 레벨(1)로 재배정 후 삭제합니다.
//    (level_id 는 화면 표시에 쓰이지 않고 레벨은 level_xp 에서 파생하므로 재배정은 무해)
async function run() {
  try {
    await client.connect();
    console.log('DB 연결됨');

    const ref = await client.query(
      'SELECT COUNT(*)::int AS cnt FROM users WHERE level_id = 5',
    );
    const cnt = ref.rows[0].cnt;

    if (cnt > 0) {
      await client.query('UPDATE users SET level_id = 1 WHERE level_id = 5');
      console.log(`level_id=5 참조 user ${cnt}명 → level_id=1 로 재배정`);
    } else {
      console.log('level_id=5 를 참조하는 user 없음');
    }

    const del = await client.query('DELETE FROM levels WHERE id = 5');
    console.log(`levels id=5 삭제: ${del.rowCount} 행`);

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
