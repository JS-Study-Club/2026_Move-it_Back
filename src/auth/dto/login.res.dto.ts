import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResDto } from '@/user/dto/user-res.dto';

export class LoginResDto {
  @ApiProperty()
  @Expose()
  user!: UserResDto;

  @ApiProperty()
  @Expose()
  accessToken!: string;

  @ApiProperty()
  @Expose()
  tokenExpires!: string;
}
