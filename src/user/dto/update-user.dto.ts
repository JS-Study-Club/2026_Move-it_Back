import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEmail, IsOptional, MinLength } from 'class-validator';

import { lowerCaseTransformer } from '@/auth/utils/transformers/lower-case.transformer';

export class UpdateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional() // TODO : 나중에 안쓰면 지우셈
  @IsOptional()
  @MinLength(6)
  password?: string | null;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  userName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  teacherId?: string | null;
}
