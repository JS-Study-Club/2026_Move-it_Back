import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Challenge } from './entities/challenge.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { VideoPoseExtractorUtil } from './utils/video-pose-extractor.util';
import 'multer';

@Injectable()
export class ChallengeService {
    private videoPoseExtractor = new VideoPoseExtractorUtil();

    constructor(@Inject('ChallengeRepository') private readonly challengeRepository: Repository<Challenge>, private readonly configService: ConfigService) { }

    private formatResponse(challenge: Challenge) {
        if (!challenge) return challenge;
        const { like_count, music, ...rest } = challenge as any;
        return {
            ...rest,
            genre: music?.genre,
            artist: music?.artist,
            length: music?.length,
            music_url: music?.music_url,
            release_date: music?.release_date,
        };
    }

    async getChallenges(id: number) {
        const result = await this.challengeRepository.findOne({ where: { id } });

        if (!result) {
            throw new NotFoundException('챌린지를 찾을 수 없습니다.');
        }

        return this.formatResponse(result);
    }

    async getChallengeBodyData(id: number) {
        const result = await this.challengeRepository.findOne({ where: { id } });

        if (!result) {
            throw new NotFoundException('챌린지를 찾을 수 없습니다.');
        }

        return result;
    }

    async createChallenge(createMusicDto: CreateMusicDto, video?: Express.Multer.File) {
        let extractedPoseData: any[] | null = null;

        if (video) {
            try {
                // 영상 전체를 분석하도록 수정 (시작과 끝 파라미터를 0과 undefined로 고정)
                extractedPoseData = await this.videoPoseExtractor.extractPoseFromVideo(
                    video.buffer,
                    0,
                    undefined
                );
            } catch (error) {
                console.error('Failed to extract pose from video:', error);
                throw new InternalServerErrorException('영상 분석(포즈 추출)에 실패했습니다.');
            }
        }

        const challenge = this.challengeRepository.create({
            name: createMusicDto.name,
            album_art_url: createMusicDto.album_art_url,
            description: createMusicDto.description,
            difficulty: createMusicDto.difficulty,
            start_time: createMusicDto.start_time || 0,
            end_time: createMusicDto.end_time || undefined,
            music: {
                genre: createMusicDto.genre,
                artist: createMusicDto.artist,
                length: createMusicDto.length,
                music_url: createMusicDto.music_url,
                release_date: createMusicDto.release_date
            },
            body_data: {
                pose_data: extractedPoseData
            }
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

        return result.map(c => this.formatResponse(c));
    }

    async getYearlyChallenges(limit: number) {
        const currentDate = new Date();
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        
        const result = await this.challengeRepository.createQueryBuilder('challenge')
            .leftJoinAndSelect('challenge.music', 'music')
            .where('challenge.createdAt >= :startOfYear', { startOfYear })
            .orderBy('challenge.view_count', 'DESC')
            .addOrderBy('challenge.like_count', 'DESC')
            .take(limit)
            .getMany();

        return result.map(c => this.formatResponse(c));
    }

    async getDailyChallenges(limit: number) {
        const date = new Date();
        date.setDate(date.getDate() - 3); // 최근 3일 내의 데이터 중 가장 인기있는 것을 선정하여 '일간 추천'의 풀을 넉넉하게

        const result = await this.challengeRepository.createQueryBuilder('challenge')
            .leftJoinAndSelect('challenge.music', 'music')
            .where('challenge.createdAt >= :date', { date })
            .orderBy('challenge.view_count', 'DESC')
            .addOrderBy('challenge.like_count', 'DESC')
            .take(limit)
            .getMany();

        return result.map(c => this.formatResponse(c));
    }

    async getRecommendKeywords() {
        const challenges = await this.challengeRepository.createQueryBuilder('challenge')
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
