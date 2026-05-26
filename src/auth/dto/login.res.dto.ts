import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @Expose()
  id!: number;

  @ApiProperty()
  @Expose()
  token!: string;

  @ApiProperty()
  @Expose()
  refreshToken!: string;

  @ApiProperty()
  @Expose()
  tokenExpires!: string;
}
