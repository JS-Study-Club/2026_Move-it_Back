import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Scope } from 'node_modules/@nestjs/common';

@Entity('user_challenges')
export class UserChallenge {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.challenges)
    @JoinColumn({ name: 'user_id' })
    users!: User;

    @Column({ type: 'json' })
    data!: JSON;

    @Column({ type: 'int' })
    score!: number;

    @Column({ type: 'varchar', length: 255 })
    comment!: string;

    @CreateDateColumn()
    createdAt!: Date;
}