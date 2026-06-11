import { ApiProperty } from '@nestjs/swagger';

// 로그인/인증 응답에서 클라이언트로 내려가는 유저 정보 (camelCase 고정)
export class AuthUserDto {
  @ApiProperty({ example: 'superMinbao' })
  userId: string;

  @ApiProperty({ example: '민바오' })
  username: string;

  @ApiProperty({ example: 1 })
  teacherId: number;

  @ApiProperty({ example: 1 })
  level: number;

  @ApiProperty({ example: 0 })
  levelXp: number;

  @ApiProperty({ example: '쑥쑥 자라는 댄스신동', required: false })
  levelTitle: string;
}

export class LoginResDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  tokenExpires!: string;
}
