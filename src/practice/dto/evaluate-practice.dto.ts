import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EvaluatePracticeDto {
  @ApiProperty({ example: 'user-uuid-1234', description: '유저 아이디' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    example: [
      { t: 0.1, l: [{ x: 0.5, y: 0.5, z: 0, v: 0.99 }] },
      { t: 0.2, l: [{ x: 0.51, y: 0.51, z: 0, v: 0.98 }] }
    ],
    description: '유저의 모션 포즈 데이터 (프론트엔드 추출 데이터)',
  })
  @IsArray()
  @IsNotEmpty()
  user_pose_data!: any[];
}
