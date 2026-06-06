import { User } from './entities/user.entity';
import { TeacherCharacter } from './entities/teacher_character.entity';
import { Level } from './entities/user_level.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, TeacherCharacter, Level])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
