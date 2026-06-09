import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from '@/user/dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResDto } from './dto/user-res.dto';
import { plainToInstance } from 'class-transformer';
import { UserChallenge } from './entities/user_challenge.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserChallenge)
    private readonly userChallengeRepository: Repository<UserChallenge>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    let hashedPassword: string | undefined = undefined;
    if (dto.password) {
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(dto.password, salt);
    }

    let email: string | null = null;
    if (dto.email) {
      const userObj = await this.userRepository.findOneBy({ email: dto.email });
      if (userObj) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: '이미 가입된 이메일',
          },
        });
      }
    }
    email = dto.email;
    const newUser = this.userRepository.create({
      username: dto.username,
      email: email,
      user_id: dto.userId,
      password: hashedPassword,
      teacher_character_id: dto.teacherId,
    });
    return await this.userRepository.save(newUser);
  }

  async findById(id: User['id']): Promise<UserResDto | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }
    return plainToInstance(UserResDto, user);
  }

  async findByUserId(userId: User['user_id']): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ user_id: userId });
    if (!user) return null;

    return user;
  }

  async findRefreshTokenById(id: User['id']): Promise<string | undefined> {
    return (await this.userRepository.findOneBy({ id }))?.refreshToken;
  }

  // findByEmail(email: User['email']): Promise<User | null> {
  //   return this.userRepository.findOneBy({ email: email });
  // }

  async update(id: User['id'], dto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    let email = user.email;
    if (dto.email) {
      const userObject = await this.userRepository.findOneBy({
        email: dto.email,
      });
      if (userObject && userObject.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
      email = dto.email;
    }

    const updatedUser = this.userRepository.create({
      ...user,
      ...dto,
      email: email,
    });
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  async updateLevel(id: User['id'], xp: number): Promise<void> {
    await this.userRepository.increment({ id }, 'level_xp', xp);
  }

  async updateRefreshToken(
    id: User['id'],
    newRefreshToken: string | null,
  ): Promise<void> {
    // throw new Error('Method not implemented.');
    const hashedRefreshToken = !newRefreshToken
      ? ''
      : await bcrypt.hash(newRefreshToken, await bcrypt.genSalt());
    await this.userRepository.update(id, {
      refreshToken: hashedRefreshToken,
    });
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.userRepository.findOneByOrFail({ id });
    await this.userRepository.softDelete(id);
  }

  async me(id: User['id']): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ id });
    return user;
  }

  async findPracticeChallengeById(id: User['id']): Promise<number | undefined> {
    const result = await this.userChallengeRepository
      .createQueryBuilder('uc')
      .select('uc.id', 'id')
      .where('uc.userId = :id', { id })
      .orderBy('uc.createdAt', 'DESC')
      .limit(1)
      .getRawOne<{ id: number }>();

    return result?.id;
  }
}
