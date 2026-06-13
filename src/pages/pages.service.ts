import { ChallengeService } from '@/challenge/challenge.service';
import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { HomeUserInfo, PageHomeResDto } from './dto/page-home.res.dto';
import { PracticeService } from '@/practice/practice.service';
import { plainToInstance } from 'class-transformer';
import { ChallengeInfo, SearchPageResDto } from './dto/page-search.res.dto';

@Injectable()
export class PagesService {
  constructor(
    private readonly userService: UserService,
    private readonly challengeService: ChallengeService,
    private readonly practiceService: PracticeService,
  ) {}
  //TODO : 노래 끝나고 난 후에 정해진 xp로 점수 올리는 로직
  //TODO : refresh logic

  async getHomePageData(userId: number): Promise<PageHomeResDto> {
    // 유저의 선생님 사진 / 레벨 / 레벨타이틀 / xp / 진행률
    const userInfo = await this.buildHomeUserInfo(userId);

    // 높은 점수를 받은 댄스 영상 | 없으면 없다고
    // 챌린지를 한 사용자를 검색 >> 반환은 챌린지의 형식 (아래와 같음)
    const highScoreDanceList =
      await this.challengeService.getUserChallenges(userId);

    // 오늘의 추천 댄스 챌린지
    const recommendedChallenge =
      await this.challengeService.getDailyChallenges(2);

    return {
      user: userInfo,
      highScoreDance: highScoreDanceList,
      recommendedChallengeList: recommendedChallenge,
    };
  }

  // 홈/마이페이지가 공통으로 쓰는 유저 정보(레벨/xp 기반 칭호/진행률 계산 포함)를 구성합니다.
  private async buildHomeUserInfo(userId: number): Promise<HomeUserInfo> {
    const userEntity = await this.userService.findById(userId);
    const levelInfo = await this.userService.resolveLevelInfo(
      userEntity?.level ?? 1,
      userEntity?.level_xp ?? 0,
    );
    return {
      userId: userEntity?.user_id ?? '',
      username: userEntity?.username ?? '',
      teacherId: userEntity?.teacher_character_id ?? 0,
      level: levelInfo.level,
      levelXp: levelInfo.xp,
      levelTitle: levelInfo.tierName,
      levelProgress: levelInfo.levelProgress,
    };
  }
  async getSearchPageData(limit: number = 3): Promise<SearchPageResDto> {
    const recommendKeywords =
      await this.challengeService.getRecommendKeywords();

    const yearlyChallenges = plainToInstance(
      ChallengeInfo,
      await this.challengeService.getYearlyChallenges(limit),
    );

    return {
      recommendKeywords,
      challenges: yearlyChallenges,
    };
  }
  async searchChallenges(target: string): Promise<ChallengeInfo[]> {
    const searchedChallenges =
      await this.challengeService.searchChallenges(target);
    return plainToInstance(ChallengeInfo, searchedChallenges);
  }
  async getDashboardPageData(userId: number, type: string) {
    const recentChallengeId =
      await this.userService.findPracticeChallengeById(userId);
    // 값이 존재하지 않음을 알려야함
    if (!recentChallengeId) {
      return {
        recentDance: null, // 프론트에게 데이터가 없음을 명시적으로 알림
        message: 'EMPTY_HISTORY',
      };
    }
    const danceResult =
      await this.practiceService.getPracticeResult(recentChallengeId);
    return danceResult;
  }

  async getMyPageData(userId: number) {
    const user = await this.buildHomeUserInfo(userId);
    const recentPracticeDance =
      await this.challengeService.getUserChallenges(userId);

    return {
      user,
      recentPracticeDance,
    };
  }
}
