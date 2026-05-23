import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Challenge {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  genre!: string;

  @Column()
  artist!: string;

  @Column()
  length!: number;

  @Column()
  music_url!: string;

  @Column()
  album_art_url!: string;

  @Column({ default: 0 })
  view_count!: number;

  @Column({ nullable: true, type: 'date' })
  release_date?: Date;

  @Column()
  description!: string;

  @Column()
  difficulty!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  
}