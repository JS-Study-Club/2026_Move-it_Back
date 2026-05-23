import { Controller, Query } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { Get, Post, Body } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateMusicDto } from './dto/create-music.dto';

@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('music')
  @ApiOperation({ summary: '챌린지 조회' })
  async getChallenges(@Query('id') id: number) {
    return await this.challengeService.getChallenges(id);
  }

  @Post('music')
  @ApiOperation({ summary: '본 API는 개발용입니다. 챌린지 음악 생성' })
  async createChallenge(@Body() createMusicDto: CreateMusicDto) {
    return await this.challengeService.createChallenge(createMusicDto);
  }

  @Get('search')
  @ApiOperation({ summary: '챌린지 음악 검색' })
  async searchChallenges(@Query('keyword') keyword: string) {
    return await this.challengeService.searchChallenges(keyword);
  }

  @Get('recommend_keyword')
  @ApiOperation({ summary: '추천 검색어 목록 반환' })
  async getRecommendKeywords() {
    return await this.challengeService.getRecommendKeywords();
  }

  @Get('suggest/yearly')
  @ApiOperation({ summary: '연간 챌린지 추천' })
  async getYearlyChallenges(@Query('limit') limit: number = 10) {
    return await this.challengeService.getYearlyChallenges(limit);
  }

  @Get('suggest/daily')
  @ApiOperation({ summary: '일간 챌린지 추천' })
  async getDailyChallenges(@Query('limit') limit: number = 10) {
    return await this.challengeService.getDailyChallenges(limit);
  }
}
