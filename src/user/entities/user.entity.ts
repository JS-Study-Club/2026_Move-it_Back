import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ForeignKey,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { TeacherCharacter } from './teacher_character.entity';
import { Levels } from './levels.entity';
import { UserChallenge } from './user_challenge.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', { unique: true, length: 255 })
  user_id!: string;

  @Column('varchar', { nullable: true, length: 32 })
  username!: string;

  @Column('varchar', { unique: true, length: 255 })
  email!: string;

  @Column('varchar', { length: 255 })
  password!: string;

  @Column({ type: 'int', nullable: true })
  teacher_character_id!: number | null;

  // 현재 레벨 (1~).
  @Column({ type: 'int', default: 1 })
  level!: number;

  // 현재 레벨 안에서의 경험치 진행 (0 ~ xpRequired-1).
  // DB 컬럼은 기존명 level_xp 유지하되, 의미는 변경됨.
  @Column({ type: 'float', default: 0 })
  level_xp!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column('varchar', { length: 255, nullable: true })
  refreshToken!: string;

  @OneToMany(() => UserChallenge, (userChallenge) => userChallenge.users)
  challenges!: UserChallenge[];

  @ManyToOne(() => TeacherCharacter, (teacher) => teacher.users)
  @JoinColumn({ name: 'teacher_character_id' })
  teacherCharacter!: TeacherCharacter;
}
