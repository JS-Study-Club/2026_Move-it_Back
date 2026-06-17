import {
  Allow,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
// import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterReqDto {
  @ApiProperty({ example: 'super민바오', type: 'string' })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\-_]+$/, {
    message: '한국어, 영어, 숫자, 특수문자(-_)만 사용할 수 있습니다',
  })
  username: string;

  @ApiProperty({ example: '9999@e-mirim.hs.kr', type: 'string' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9.\-_]+\.[a-zA-Z]{2,}$/, {
    message:
      '이메일 앞자리에는 영문, 숫자, 특수문자(., -, _)만 사용할 수 있습니다.',
  })
  email: string;

  @ApiProperty({ example: 'superMinbao', type: 'string' })
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  @Allow()
  @Matches(/^[a-zA-Z0-9\-_]+$/, {
    message: '아이디는 영어, 숫자, 특수문자(-, _)만 사용할 수 있습니다.',
  })
  userId: string;

  @ApiProperty({ example: 'q1w2e3r4!!', type: 'string' })
  @MinLength(6)
  @MaxLength(32)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/, {
    message:
      '비밀번호는 영문, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({ example: '1', type: 'integer', required: false })
  @IsOptional()
  @IsInt()
  teacherId?: number;
}
