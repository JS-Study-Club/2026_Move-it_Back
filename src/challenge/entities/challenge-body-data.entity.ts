import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Challenge } from './challenge.entity';

@Entity()
export class ChallengeBodyData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'json', nullable: true })
  pose_data!: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Challenge, challenge => challenge.body_data)
  challenge!: Challenge;
}
