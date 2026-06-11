import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TeacherCharacter } from './entities/teacher_character.entity';
import { Levels } from './entities/levels.entity';
import { UserChallenge } from './entities/user_challenge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserChallenge, TeacherCharacter, Levels]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
