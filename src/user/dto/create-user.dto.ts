import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  // decorators here
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { lowerCaseTransformer } from '../../auth/utils/transformers/lower-case.transformer';
import { Optional } from '@nestjs/common';

export class CreateUserDto {
  @ApiProperty({ example: '민바오', type: String })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '1111@e-mirim.hs.kr', type: String })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'minba0', type: String })
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @Optional()
  refreshToken?: string;
}
