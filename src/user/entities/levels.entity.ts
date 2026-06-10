import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('levels')
export class Levels {
  @Column({ type: 'int', primary: true })
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  levelTitle!: string;
}
