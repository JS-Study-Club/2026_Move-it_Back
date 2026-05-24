import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ForeignKey, ManyToOne, JoinColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column('varchar', {length:32})
  user_id: string;

  @Column('varchar', {unique: true, length:255})
  email: string;

  @Column('varchar', {nullable: true, length:32}) 
  name: string;

  @Column('varchar', {length:255})
  password: string;

  @Column({type:'int'})
  teacher_character_id: number;

  @Column({type:'int', default:1})
  level: number;

  @Column({type:'int'})
  level_id: number;
  
  @Column({type:'int', default:0})
  level_xp: number;

  @CreateDateColumn() 
  createdAt: Date;

 

  // @ManyToOne(() => TeacherCharacter, (teacher) => teacher.users)
  // @JoinColumn({ name: 'teacher_character_id' }) 
  // teacherCharacter: TeacherCharacter; 

  // @ManyToOne(() => Level, (levelInfo) => levelInfo.users)
  // @JoinColumn({ name: 'level_id' })
  // levelInfo: Level;
}