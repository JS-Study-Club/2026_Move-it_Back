import { Controller, Post, Body, Param, ParseIntPipe, Get, Query } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { EvaluatePracticeDto } from './dto/evaluate-practice.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Practice')
@Controller('practice')
export class PracticeController {
	constructor(private readonly practiceService: PracticeService) { }

	/**
	 * 클라이언트가 보낸 유저 모션 데이터와 DB에 있는 챌린지 원본 모션 데이터를 비교하여 평가 결과를 반환합니다.
	 * MediaPipe Pose Landmarker
	 */
	@Post(':challengeId/evaluate')
	@ApiOperation({ summary: '유저 연습 결과 평가 및 저장', description: '프론트엔드에서 추출한 포즈 데이터를 전송하여 서버 데이터와 비교합니다.' })
	async evaluatePractice(
		@Param('challengeId', ParseIntPipe) challengeId: number,
		@Body() dto: EvaluatePracticeDto,
	) {
		return this.practiceService.evaluatePractice(challengeId, dto);
	}

	/**
	 * 특정 연습(평가) 결과 상세 가져오기
	 */
	@Get('result/:userChallengeId')
	@ApiOperation({ summary: '연습 결과 상세 조회' })
	async getPracticeResult(
		@Param('userChallengeId', ParseIntPipe) userChallengeId: number,
	) {
		return this.practiceService.getPracticeResult(userChallengeId);
	}

	/**
	 * 유저의 연습 결과 목록 가져오기 (옵션: 특정 챌린지만 필터링)
	 */
	@Get('results/user/:userId')
	@ApiOperation({ summary: '유저의 전체 연습 결과 목록 조회' })
	async getUserPracticeResults(
		@Param('userId') userId: string,
		@Query('challengeId') challengeId?: string,
	) {
		return this.practiceService.getUserPracticeResults(
			userId,
			challengeId ? parseInt(challengeId, 10) : undefined,
		);
	}
}
