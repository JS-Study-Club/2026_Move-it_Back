import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose() 
  id: number;

  @Expose()
  username: string;

  @Exclude() 
  password: string;

//   @Exclude()
//   salt: string;
}