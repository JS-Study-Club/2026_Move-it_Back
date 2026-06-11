const { Client } = require('pg');

const client = new Client({
  host: '168.107.26.152',
  port: 5432,
  user: 'moveit',
  password: 'jsstudy15th',
  database: 'moveit',
});

async function updateLevels() {
  try {
    await client.connect();
    console.log('DB 연결됨');

    // levels 테이블 업데이트
    const levelTitles = [
      { id: 1, title: '쑥쑥 자라는 댄스신동' },
      { id: 2, title: '리듬을 깨우친 댄스 유망주' },
      { id: 3, title: '무대를 장악하는 댄스 스타' },
      { id: 4, title: '전설의 댄스 마스터' },
    ];

    for (const level of levelTitles) {
      await client.query(
        'UPDATE levels SET "levelTitle" = $1 WHERE id = $2',
        [level.title, level.id]
      );
      console.log(`✓ Level ${level.id} (${level.title}) 업데이트됨`);
    }

    console.log('✓ 완료!');
  } catch (error) {
    console.error('에러:', error.message);
  } finally {
    await client.end();
  }
}

updateLevels();
