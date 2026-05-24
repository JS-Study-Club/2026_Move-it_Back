import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { TeacherCharacter } from './entities/teacher_character.entity';
import { Level } from './entities/user_level.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([User, TeacherCharacter, Level])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
