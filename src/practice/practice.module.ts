import { Module } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { Practice } from './entities/practice.entity';
import { ChallengeBodyData } from '../challenge/entities/challenge-body-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChallenge } from '../user/entities/user_challenge.entity';
import { User } from '../user/entities/user.entity';
import { Challenge } from '../challenge/entities/challenge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Practice,
      ChallengeBodyData,
      UserChallenge,
      User,
      Challenge,
    ]),
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
