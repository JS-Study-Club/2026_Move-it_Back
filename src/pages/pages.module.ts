import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { UserModule } from '@/user/user.module';
import { ChallengeModule } from '@/challenge/challenge.module';
import { PracticeModule } from '@/practice/practice.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserChallenge } from '@/user/entities/user_challenge.entity';

@Module({
  imports: [
    UserModule,
    PracticeModule,
    ChallengeModule,
    TypeOrmModule.forFeature([UserChallenge]),
  ],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
