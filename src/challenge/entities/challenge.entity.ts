import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ChallengeMusic } from './challenge-music.entity';
import { ChallengeBodyData } from './challenge-body-data.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  // @Column()
  // title!: string;

  @Column({ default: 0 })
  view_count!: number;

  @Column({ default: 0 })
  like_count!: number;

  @Column()
  description!: string;

  @Column()
  difficulty!: string;

  @Column({ type: 'int', default: 0 })
  start_time!: number;

  @Column({ type: 'int', nullable: true })
  end_time!: number;

  // 촬영(녹화) 길이(초). 미설정(null)이면 서비스/프론트에서 20초를 기본으로 사용한다.
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'int', nullable: false })
  score!: number;

  @Column({ type: 'text', nullable: true })
  video_url?: string;

  @OneToOne(() => ChallengeMusic, (music) => music.challenges, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'music_id' })
  music!: ChallengeMusic;

  @OneToOne(() => ChallengeBodyData, (bodyData) => bodyData.challenge, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'body_data_id' })
  body_data!: ChallengeBodyData;
}
