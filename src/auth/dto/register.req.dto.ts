import {
  Allow,
  IsEmail,
  IsNotEmpty,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterReqDto {
  @ApiProperty({ example: '민바오' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  userName: string;

  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  @MinLength(8)
  @MaxLength(32)
  email: string;

  @ApiProperty({ example: 'minba0' })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(15)
  @Allow()
  userId: string;

  @ApiProperty()
  @MinLength(6)
  @MaxLength(32)
  password: string;

  @IsNotEmpty() //TODO :  Id validation
  teacherId: string;
}
