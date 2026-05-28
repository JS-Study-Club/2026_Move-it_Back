import { Exclude, Expose } from 'class-transformer';

export class UserWithPwDto {
  @Expose()
  id: number;

  @Expose()
  userId: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  password: string;
}
