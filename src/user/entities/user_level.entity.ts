import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('user_levels')
export class Level {
    @Column({ type: 'int', primary: true })
    id!: number

    @ManyToOne(() => Level, (level) => level.id)
    @JoinColumn({ name: 'user_id' })
    users!: User;

    @Column({ type: 'varchar', length: 255 })
    content!: string;
}