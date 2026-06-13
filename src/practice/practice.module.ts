import { Module } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { Practice } from './entities/practice.entity';
import { ChallengeBodyData } from '../challenge/entities/challenge-body-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChallenge } from '../user/entities/user_challenge.entity';
import { User } from '../user/entities/user.entity';
import { Challenge } from '../challenge/entities/challenge.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Practice,
      ChallengeBodyData,
      UserChallenge,
      User,
      Challenge,
    ]),
    // 연습 완료 시 level_xp 를 올리기 위해 UserService 를 사용합니다.
    UserModule,
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
