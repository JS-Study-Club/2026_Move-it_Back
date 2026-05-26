import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginReqDto {
  @ApiProperty({ example: 'minba0', type: String })
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
