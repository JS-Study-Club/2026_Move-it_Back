import { Exclude, Expose } from 'class-transformer';

export class UserResDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Exclude()
  password: string;

  //   @Exclude()
  //   salt: string;
}
