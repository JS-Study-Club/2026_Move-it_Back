import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { ChallengeMusic } from './challenge-music.entity';
import { ChallengeBodyData } from './challenge-body-data.entity';

@Entity()
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
