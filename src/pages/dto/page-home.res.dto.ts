import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from './base.dto';
import { Challenge } from '@/challenge/entities/challenge.entity';

export class HomeUserInfo extends BaseDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsNumber()
  @IsNotEmpty()
  level: number;

  @IsNumber()
  @IsNotEmpty()
  levelXp: number;

  @IsString()
  @IsNotEmpty()
  levelTitle: string;
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
