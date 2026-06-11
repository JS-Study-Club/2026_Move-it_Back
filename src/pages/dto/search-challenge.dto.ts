import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchChallengeDto {
  @ApiProperty({
    description: '검색할 댄스 챌린지 제목 또는 키워드',
    example: '홍박사',
    required: true,
  })
  @IsString({ message: '검색어는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '검색어를 입력해주세요. 빈 값은 허용되지 않습니다.' })
  target: string;
}
