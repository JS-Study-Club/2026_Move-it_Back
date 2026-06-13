import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { BaseDto } from './base.dto';
import { Challenge } from '@/challenge/entities/challenge.entity';

export class HomeUserInfo extends BaseDto {
  userId: string;
  username: string;
  teacherId: number;
  level: number;
  levelXp: number;
  levelTitle: string;
  // 현재 레벨 안에서의 진행률(0~100). 프론트 진행바가 이 값을 사용합니다.
  levelProgress: number;
}

export class HighScoreDanceInfoDto extends BaseDto {
  @Expose({ name: 'createdAt' })
  createdAt: Date;
}

export class RecommendedChallengeListDto extends BaseDto {
  @Expose({ name: 'view_count' })
  viewCount: number;
}

export class ChallengeResDto extends BaseDto {
  id: number;
  artist: string;
  name: string;
  title: string;
  genre: string;

  score: number;

  @Expose({ name: 'music_url' })
  musicUrl: string;

  @Expose({ name: 'music_img_url' })
  imgUrl: string;

  @Transform(({ value }) => value.toISOString())
  @Expose({ name: 'release_date' })
  releaseDate: string;

  description: string;
}

export class PageHomeResDto extends BaseDto {
  @Type(() => HomeUserInfo)
  @ValidateNested()
  user: HomeUserInfo;

  @IsArray()
  @Type(() => HighScoreDanceInfoDto)
  highScoreDance: HighScoreDanceInfoDto[];

  @IsArray()
  @Type(() => RecommendedChallengeListDto)
  recommendedChallengeList: RecommendedChallengeListDto[];
}
