import { Controller, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { CreateMusicDto } from './dto/create-music.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('music')
  @ApiOperation({ summary: '챌린지 조회' })
  async getChallenges(@Query('id') id: number) {
    return await this.challengeService.getChallenges(id);
  }

  @Post('music')
  @ApiOperation({ summary: '본 API는 개발용입니다. 챌린지 음악 생성 및 영상에서 포즈 데이터 자동 추출' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('video'))
  async createChallenge(
    @Body() createMusicDto: CreateMusicDto,
    @UploadedFile() video?: Express.Multer.File,
  ) {
    console.log('HTTP: /challenge/music POST received');
    console.log('HTTP: createMusicDto fields:', { name: createMusicDto.name, length: createMusicDto.length, start_time: createMusicDto.start_time, end_time: createMusicDto.end_time });
    if (video) console.log('HTTP: video received, size:', video.size);
    return await this.challengeService.createChallenge(createMusicDto, video);
  }

  @Get('body-data')
  @ApiOperation({ summary: '챌린지의 원본 모션 데이터 조회' })
  async getChallengeBodyData(@Query('id') id: number) {
    const challenge = await this.challengeService.getChallengeBodyData(id);
    if (!challenge) {
      throw new BadRequestException('챌린지를 찾을 수 없습니다.');
    }
    return challenge.body_data?.pose_data;
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
