import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Challenge } from '../../challenge/entities/challenge.entity';

@Entity('user_challenges')
export class UserChallenge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'varchar' }) // User의 id 타입이 string이므로 varchar
  userId!: string;

  @Column({ name: 'challenge_id', type: 'int' })
  challengeId!: number;

  @ManyToOne(() => User, (user) => user.challenges)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' }) // name을 일치시킴
  users!: User;

  @ManyToOne(() => Challenge)
  @JoinColumn({ name: 'challenge_id', referencedColumnName: 'id' }) // name을 일치시킴
  challenge!: Challenge;

  @Column({ type: 'json' })
  data!: JSON;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'varchar', length: 255 })
  comment!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
