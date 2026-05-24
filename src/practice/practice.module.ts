import { Module } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { Practice } from './entities/practice.entity';
import { ChallengeBodyData } from '../challenge/entities/challenge-body-data.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Practice, ChallengeBodyData])],
  controllers: [PracticeController],
  providers: [PracticeService],
})
export class PracticeModule {}
