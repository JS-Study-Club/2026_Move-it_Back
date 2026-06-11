const { Client } = require('pg');

const client = new Client({
  host: '168.107.26.152',
  port: 5432,
  user: 'moveit',
  password: 'jsstudy15th',
  database: 'moveit',
});

async function seedLevels() {
  try {
    await client.connect();
    console.log('DB 연결됨');

    // levels 테이블에 기본 레벨들 추가
    const levelTitles = [
      '쑥쑥 자라는 댄스신동',       // id=1
      '리듬을 깨우친 댄스 유망주',   // id=2
      '무대를 장악하는 댄스 스타',   // id=3
      '전설의 댄스 마스터',         // id=4
    ];

    for (let i = 0; i < levelTitles.length; i++) {
      const id = i + 1;
      const title = levelTitles[i];

      // 먼저 존재 여부 확인
      const checkRes = await client.query(
        'SELECT 1 FROM levels WHERE id = $1',
        [id]
      );

      if (checkRes.rows.length === 0) {
        // 없으면 INSERT
        await client.query(
          'INSERT INTO levels (id, "levelTitle") VALUES ($1, $2)',
          [id, title]
        );
        console.log(`✓ Level ${id} (${title}) 추가됨`);
      } else {
        console.log(`✓ Level ${id}는 이미 존재함`);
      }
    }

    console.log('✓ 완료!');
  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await client.end();
  }
}

seedLevels();
