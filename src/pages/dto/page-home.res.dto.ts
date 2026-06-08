import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseDto } from './base.dto';

export class HomeUserInfo extends BaseDto {
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

export class highScoreDanceInfoDto extends BaseDto {
  title: string;
  releasedAt: string;
  xp: number;
  img_url: string;
}

export class RecommendedChallengeListDto extends BaseDto {
  img_url: string;
  title: string;
  comment: string;
  hashtag: string[];
}

export class PageHomeResDto extends BaseDto {
  @Type(() => HomeUserInfo)
  @ValidateNested()
  user: HomeUserInfo;

  @IsArray()
  @Type(() => highScoreDanceInfoDto)
  @ValidateNested({ each: true })
  highScoreDance: highScoreDanceInfoDto[];

  @IsArray()
  @Type(() => RecommendedChallengeListDto)
  recommendedChallengeList: RecommendedChallengeListDto[];
}
