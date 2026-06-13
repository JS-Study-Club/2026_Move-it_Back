import { Column, Entity } from 'typeorm';

// 레벨별 정보. 각 행은 레벨 1~N 정의.
// users.level 이 이 테이블의 id 를 참조하지 않고(FK 없음),
// 자체적으로 1, 2, 3, ... 값을 가집니다.
// 이 테이블은 "각 레벨의 칭호와 다음 레벨 도달에 필요한 xp" 정보만 제공합니다.
@Entity('levels')
export class Levels {
  @Column({ type: 'int', primary: true })
  id!: number; // 레벨 번호 (1~)

  // 칭호 이름. 레벨 범위별로 같은 값이 반복됩니다.
  // 예: 1~9 → "쑥쑥 자라는 댄스신동", 10~29 → "리듬을 깨우친 댄스 유망주"
  @Column({ type: 'varchar', length: 255, nullable: true })
  tierName!: string;

  // 이 레벨에서 다음 레벨(id+1)로 진행하는 데 필요한 경험치.
  // 예: id=1, xpRequired=5 → 레벨 1→2 도달에 xp 5 필요
  // 최고 레벨(id=N)은 xpRequired가 정해져도 무관(상한이 없으므로 의미 없음).
  @Column({ type: 'float', default: 5 })
  xpRequired!: number;
}
