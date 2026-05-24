import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Challenge } from './challenge.entity';

@Entity('challenge_music')
export class ChallengeMusic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  genre!: string;

  @Column()
  artist!: string;

  @Column()
  length!: number;

  @Column()
  music_url!: string;

  @Column({ nullable: true, type: 'date' })
  release_date?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Challenge, challenge => challenge.music)
  challenges!: Challenge[];
}
