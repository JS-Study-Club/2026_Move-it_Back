import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('teacher_characters')
export class TeacherCharacter {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    major!: string;

    @Column({ type: 'varchar', length: 255 })
    hashtag!: string;

    @Column({ type: 'varchar', length: 255 })
    comment!: string;

    // @Column({ type: 'text' })
    // img_url!: string;

    @OneToMany(() => User, user => user.teacherCharacter)
    users!: User[];
}