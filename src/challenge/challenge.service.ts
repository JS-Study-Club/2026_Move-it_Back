import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Challenge } from './entities/challenge.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { VideoPoseExtractorUtil } from './utils/video-pose-extractor.util';
import 'multer';
import { InjectRepository } from '@nestjs/typeorm';
import { ChallengeMusic } from './entities/challenge-music.entity';
import { UserChallenge } from '@/user/entities/user_challenge.entity';
import { HighScoreDanceInfoDto } from '@/pages/dto/page-home.res.dto';

// 미디어 파일 기본 경로 (music_url / music_image_url 자동 생성에 사용)
const MEDIA_BASE_URL = 'https://minjae1025.duckdns.org/moveit';
// 파일명 규칙: 전부 소문자 + 공백을 '_' 로. 예) 'Sasane','Mosi Mosi' → 'sasane-mosi_mosi'
const buildMediaSlug = (artist: string, name: string): string =>
  `${artist}-${name}`.trim().toLowerCase().replace(/\s+/g, '_');
// 사용자가 '.mp3' 처럼 점을 붙여 넣어도 정상 처리되도록 앞쪽 점을 제거
const stripDot = (ext: string): string => ext.replace(/^\./, '');

@Injectable()
export class ChallengeService {
  private videoPoseExtractor = new VideoPoseExtractorUtil();

  // constructor(@Inject('ChallengeRepository') private readonly challengeRepository: Repository<Challenge>, private readonly configService: ConfigService) { }
  constructor(
    @InjectRepository(Challenge)
    private readonly challengeRepository: Repository<Challenge>,

    @InjectRepository(ChallengeMusic)
    private readonly challengeMusicRepository: Repository<ChallengeMusic>,

    @InjectRepository(UserChallenge)
    private readonly userChallengeRepository: Repository<UserChallenge>,
  ) {}

  private formatResponse(challenge: Challenge) {
    if (!challenge) return challenge;
    // body_data(포즈 원본 데이터)는 목록 응답에서 불필요하게 크므로 제외합니다.
    const { like_count, music, body_data, ...rest } = challenge as any;
    return {
      ...rest,
      genre: music?.genre,
      artist: music?.artist,
      length: music?.length,
      music_url: music?.music_url,
      // 프론트 썸네일 표시에 사용됩니다.
      music_image_url: music?.music_image_url ?? null,
      release_date: music?.release_date,
      // 촬영(녹화) 길이(초). 미설정 시 20초 기본.
      duration: challenge.duration ?? 20,
    };
  }

  async getChallenges(id: number) {
    // music 은 eager 로 로드되므로 findOne 으로 충분합니다.
    const result = await this.challengeRepository.findOne({
      where: { id: Number(id) },
    });

    if (!result) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    // 검색/추천 응답과 동일한 형태(duration, music_url 등 포함)로 내려줍니다.
    return this.formatResponse(result);
  }
  async getUserChallenges(userId: number): Promise<HighScoreDanceInfoDto[]> {
    const challengeData = await this.userChallengeRepository
      .createQueryBuilder('uc')
      .select([
        'uc.id AS uc_id',
        'uc.challenge_id AS challenge_id ',
        'uc.score AS score',
        'uc.createdAt AS createdAt',
      ])
      .where('uc.user_id = :userId', { userId })
      .orderBy('uc.score', 'DESC')
      .limit(3)
      .getRawMany();

    const ids = challengeData.map((v) => Number(v.challenge_id));

    if (ids.length === 0) {
      return [];
    }

    const challenges = await this.challengeRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.music', 'cm')
      .where('c.id IN (:...ids)', { ids })
      .getMany();

    const challengeMap = new Map(
      challengeData.map((v) => [Number(v.challenge_id), v]),
    );

    return challenges.map((challenge) => {
      const uc = challengeMap.get(challenge.id);

      return {
        id: challenge.id,
        // 피드백 상세(/feedback/:userChallengeId) 진입에 필요한 연습 결과 식별자
        userChallengeId: uc?.uc_id ?? null,
        name: challenge.name,
        title: challenge.title,
        description: challenge.description,

        artist: challenge.music?.artist ?? '',
        genre: challenge.music?.genre ?? '',
        musicUrl: challenge.music?.music_url ?? '',
        imgUrl: challenge.music?.music_image_url ?? '',
        releaseDate: challenge.music?.release_date ?? '',

        score: uc?.score ?? 0,
        createdAt: uc?.createdAt ?? '',
      };
    });
  }

  async getChallengeBodyData(id: number) {
    const result = await this.challengeRepository.findOne({ where: { id } });

    if (!result) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    return result;
  }

  async createChallenge(
    createMusicDto: CreateMusicDto,
    video?: Express.Multer.File,
  ) {
    let extractedPoseData: any[] | null = null;

    if (video) {
      try {
        // 영상 전체를 분석하도록 수정 (시작과 끝 파라미터를 0과 undefined로 고정)
        extractedPoseData = await this.videoPoseExtractor.extractPoseFromVideo(
          video.buffer,
          0,
          undefined,
        );
      } catch (error) {
        console.error('Failed to extract pose from video:', error);
        throw new InternalServerErrorException(
          '영상 분석(포즈 추출)에 실패했습니다.',
        );
      }
    }

    // music_url / music_image_url 은 입력이 있으면 그대로, 없으면 artist-name 규칙으로 자동 생성.
    const slug = buildMediaSlug(createMusicDto.artist, createMusicDto.name);
    const musicExt = stripDot(createMusicDto.music_ext ?? 'mp3');
    const imageExt = stripDot(createMusicDto.image_ext ?? 'webp');
    const musicUrl =
      createMusicDto.music_url ??
      `${MEDIA_BASE_URL}/music/${slug}.${musicExt}`;
    const musicImageUrl =
      createMusicDto.music_image_url ??
      `${MEDIA_BASE_URL}/album_art/${slug}.${imageExt}`;

    const challenge = this.challengeRepository.create({
      name: createMusicDto.name,
      // title 컬럼은 NOT NULL 이지만 생성 DTO에 별도 title 입력이 없어 곡명을 사용합니다.
      title: createMusicDto.name,
      description: createMusicDto.description,
      difficulty: createMusicDto.difficulty,
      // score 컬럼도 NOT NULL 이므로 기본값 0으로 채웁니다.
      score: 0,
      start_time: createMusicDto.start_time || 0,
      end_time: createMusicDto.end_time || undefined,
      // 촬영(녹화) 길이(초). 미입력 시 20초를 기본으로 저장.
      duration: createMusicDto.duration ?? 20,
      music: {
        genre: createMusicDto.genre,
        artist: createMusicDto.artist,
        length: createMusicDto.length,
        music_url: musicUrl,
        music_image_url: musicImageUrl,
        release_date: createMusicDto.release_date,
      },
      // body_data: {
      //   pose_data: extractedPoseData,
      // },
    });
    const saved = await this.challengeRepository.save(challenge);
    return this.formatResponse(saved);
  }

  async searchChallenges(keyword: string) {
    const result = await this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.music', 'music')
      .where('challenge.name ILIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('music.artist ILIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();

    return result.map((c) => this.formatResponse(c));
  }

  async getYearlyChallenges(limit: number) {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

    const result = await this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.music', 'music')
      .where('challenge.createdAt >= :startOfYear', { startOfYear })
      .orderBy('challenge.view_count', 'DESC')
      .addOrderBy('challenge.like_count', 'DESC')
      .take(limit)
      .getMany();

    return result.map((c) => this.formatResponse(c));
  }

  async getDailyChallenges(limit: number) {
    const date = new Date();
    date.setDate(date.getDate() - 3);

    const challenges = await this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.music', 'music')
      .where('challenge.createdAt >= :date', { date })
      .orderBy('challenge.view_count', 'DESC')
      .addOrderBy('challenge.like_count', 'DESC')
      .take(limit)
      .getMany();

    return challenges.map((challenge) => ({
      id: challenge.id,
      name: challenge.name,
      title: challenge.title,
      description: challenge.description,

      viewCount: challenge.view_count,
      artist: challenge.music?.artist ?? '',
      genre: challenge.music?.genre ?? '',
      musicUrl: challenge.music?.music_url ?? '',
      imgUrl: challenge.music?.music_image_url ?? '',
      releaseDate: challenge.music?.release_date ?? '',
      length: challenge.music?.length ?? 0,
    }));
  }

  async getRecommendKeywords() {
    const challenges = await this.challengeRepository
      .createQueryBuilder('challenge')
      .leftJoinAndSelect('challenge.music', 'music')
      .orderBy('challenge.view_count', 'DESC')
      .addOrderBy('challenge.like_count', 'DESC')
      .take(10)
      .getMany();

    const keywords = new Set<string>();
    for (const c of challenges) {
      if (c.name) keywords.add(c.name);
      if (c.music?.artist) keywords.add(c.music.artist);
    }

    return Array.from(keywords).slice(0, 10);
  }
}
