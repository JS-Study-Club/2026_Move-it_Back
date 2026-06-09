import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Challenge } from '@/challenge/entities/challenge.entity';
import { ChallengeMusic } from '@/challenge/entities/challenge-music.entity';
import { ChallengeBodyData } from '@/challenge/entities/challenge-body-data.entity';
import { UserChallenge } from '@/user/entities/user_challenge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Challenge,
      ChallengeMusic,
      ChallengeBodyData,
      UserChallenge,
    ]),
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
