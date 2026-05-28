import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { ChallengeMusic } from './challenge-music.entity';
import { ChallengeBodyData } from './challenge-body-data.entity';

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  album_art_url!: string;

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
  end_time?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => ChallengeMusic, music => music.challenges, { cascade: true, eager: true })
  @JoinColumn({ name: 'music_id' })
  music!: ChallengeMusic;

  @OneToOne(() => ChallengeBodyData, bodyData => bodyData.challenge, { cascade: true, eager: true })
  @JoinColumn({ name: 'body_data_id' })
  body_data!: ChallengeBodyData;
}
