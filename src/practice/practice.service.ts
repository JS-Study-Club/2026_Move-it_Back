import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChallengeBodyData } from '../challenge/entities/challenge-body-data.entity';
import { EvaluatePracticeDto } from './dto/evaluate-practice.dto';
import { PoseEvaluator } from './utils/pose-evaluator.util';
import { FEEDBACK_MESSAGES } from './constants/feedback.constant';

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(ChallengeBodyData)
    private readonly challengeBodyDataRepository: Repository<ChallengeBodyData>,
  ) {}

  async evaluatePractice(challengeId: number, dto: EvaluatePracticeDto) {
    const { user_pose_data } = dto;

    const challengeBodyData = await this.challengeBodyDataRepository.findOne({
      where: { challenge: { id: challengeId } },
      relations: ['challenge'],
    });

    if (!challengeBodyData || !challengeBodyData.pose_data) {
      throw new NotFoundException(`해당 챌린지의 바디 데이터를 찾을 수 없습니다.`);
    }

    const targetPoseData = challengeBodyData.pose_data;

    // 1. Math evaluation using PoseEvaluator
    const scores = PoseEvaluator.evaluate(targetPoseData, user_pose_data);
    const totalScore = Math.round((scores.rhythm + scores.accuracy + scores.expression) / 3);

    // 2. Map to feedback text
    const feedback = this.generateFeedback(totalScore, scores);

    return {
      challengeId,
      scores: {
        total: totalScore,
        rhythm: scores.rhythm,
        accuracy: scores.accuracy,
        expression: scores.expression,
      },
      feedback,
    };
  }

  private generateFeedback(totalScore: number, scores: { rhythm: number; accuracy: number; expression: number }) {
    // Overall feedback
    let overall = FEEDBACK_MESSAGES.overall.needs_practice;
    if (totalScore >= 90) overall = FEEDBACK_MESSAGES.overall.excellent;
    else if (totalScore >= 70) overall = FEEDBACK_MESSAGES.overall.good;

    // Determine good/bad for each category
    const details = {
      rhythm: this.getCategoryFeedback('rhythm', scores.rhythm),
      accuracy: this.getCategoryFeedback('accuracy', scores.accuracy),
      expression: this.getCategoryFeedback('expression', scores.expression),
    };

    return {
      overall,
      details,
    };
  }

  private getCategoryFeedback(category: 'rhythm' | 'accuracy' | 'expression', score: number) {
    const categoryMessages = FEEDBACK_MESSAGES.categories[category];
    const isGood = score >= 80;

    // Select a random message from good or bad array
    const messages = isGood ? categoryMessages.good : categoryMessages.bad;
    const randomIndex = Math.floor(Math.random() * messages.length);

    return {
      isGood,
      message: messages[randomIndex],
    };
  }
}

