import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginReqDto {
  @ApiProperty({ example: 'superMinbao', type: String })
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'q1w2e3r4!!', type: String })
  @IsNotEmpty()
  password: string;
}
