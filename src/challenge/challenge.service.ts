import { Inject, Injectable } from '@nestjs/common';
import { Challenge } from './entities/challenge.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';

@Injectable()
export class ChallengeService {
    constructor(@Inject('ChallengeRepository') private readonly challengeRepository: Repository<Challenge>, private readonly configService: ConfigService) { }

    async getChallenges(id: number) {
        const result = await this.challengeRepository.findOne({ where: { id } });

        if (!result) {
            throw new NotFoundException('챌린지를 찾을 수 없습니다.');
        }

        return result;
    }

    async createChallenge(createMusicDto: CreateMusicDto) {
        const challenge = this.challengeRepository.create(createMusicDto);
        return await this.challengeRepository.save(challenge);
    }

    async searchChallenges(keyword: string) {
        const result = await this.challengeRepository
            .createQueryBuilder('challenge')
            .where('challenge.name ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('challenge.artist ILIKE :keyword', { keyword: `%${keyword}%` })
            .getMany(); 

        return result;
    }
}
