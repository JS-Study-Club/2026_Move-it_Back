import { Exclude, Expose } from 'class-transformer';

export class UserResDto {
  @Expose()
  id: number;

  @Expose()
  userId: string;

  @Expose()
  username: string;

  @Exclude()
  email: string;
}
