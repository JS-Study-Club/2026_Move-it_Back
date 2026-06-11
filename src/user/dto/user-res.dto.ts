import { Exclude, Expose } from 'class-transformer';

export class UserResDto {
  @Exclude()
  id: number;

  @Expose({ name: 'user_id' })
  userId: string;

  @Expose({ name: 'teacher_character_id' })
  teacherId: string;

  @Expose()
  username: string;

  @Exclude()
  password: string;

  @Exclude()
  email: string;

  @Expose()
  level: number;

  @Expose({ name: 'level_xp' })
  levelXp: number;

  @Expose({ name: 'level_title' })
  levelTitle: string;
}
