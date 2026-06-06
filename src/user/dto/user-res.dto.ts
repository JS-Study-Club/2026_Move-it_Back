import { Exclude, Expose } from 'class-transformer';

export class UserResDto {
  @Exclude()
  id: number;

  @Expose()
  userId: string;

  @Expose()
  username: string;

  @Exclude()
  password: string;

  @Exclude()
  email: string;

  @Expose()
  level: number;

  @Expose()
  levelXp: number;

  @Expose()
  levelTitle: string;
}
