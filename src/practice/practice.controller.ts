import { Controller, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { EvaluatePracticeDto } from './dto/evaluate-practice.dto';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  /**
   * 클라이언트가 보낸 유저 모션 데이터와 DB에 있는 챌린지 원본 모션 데이터를 비교하여 평가 결과를 반환합니다.
   * MediaPipe Pose Landmarker
   */
  @Post(':challengeId/evaluate')
  async evaluatePractice(
    @Param('challengeId', ParseIntPipe) challengeId: number,
    @Body() dto: EvaluatePracticeDto,
  ) {
    return this.practiceService.evaluatePractice(challengeId, dto);
  }
}
