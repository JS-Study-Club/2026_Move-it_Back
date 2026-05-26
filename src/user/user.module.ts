import { User } from './entities/user.entity';
import { TeacherCharacter } from './entities/teacher_character.entity';
import { Level } from './entities/user_level.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([User, TeacherCharacter, Level])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
