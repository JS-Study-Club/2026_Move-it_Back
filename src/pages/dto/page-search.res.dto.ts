import { Type } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class SearchPageResDto {
  @IsArray()
  @IsString({ each: true })
  recommendKeywords: string[];
  // 챌린지
  @IsArray()
  @Type(() => ChallengeInfo)
  challenges: ChallengeInfo[];
}

export class ChallengeInfo {
  album_art_url: string;
  title: string;
  rank?: number;
  artist: string;
}
