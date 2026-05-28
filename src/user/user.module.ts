<<<<<<< HEAD
import { User } from './entities/user.entity';
import { TeacherCharacter } from './entities/teacher_character.entity';
import { Level } from './entities/user_level.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Module } from '@nestjs/common';
=======
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
>>>>>>> upstream/dev

@Module({
  controllers: [UserController],
  providers: [UserService],
<<<<<<< HEAD
  exports: [UserService],
=======
>>>>>>> upstream/dev
})
export class UserModule {}
