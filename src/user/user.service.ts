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
import { UserChallenge } from './entities/user_challenge.entity';
import { Levels } from './entities/levels.entity';
import { getTierName, getXpRequired } from './utils/level.util';

export interface UserLevelInfo {
  level: number; // 현재 레벨 (1~)
  xp: number; // 현재 레벨 내 진행 xp
  levelProgress: number; // 현재 레벨 내 진행률 0~100
  tierName: string; // 칭호
  xpRequired: number; // 다음 레벨까지 필요한 xp
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserChallenge)
    private readonly userChallengeRepository: Repository<UserChallenge>,

    @InjectRepository(Levels)
    private readonly levelsRepository: Repository<Levels>,
  ) {}

  // 현재 레벨과 xp로부터 칭호/진행률을 계산합니다.
  async resolveLevelInfo(level: number, xp: number): Promise<UserLevelInfo> {
    const xpRequired = getXpRequired(level);
    const levelProgress = Math.min(
      100,
      Math.max(0, Math.round((xp / xpRequired) * 100)),
    );

    return {
      level,
      xp: Math.max(0, xp),
      levelProgress,
      tierName: getTierName(level),
      xpRequired,
    };
  }

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
        throw new UnprocessableEntityException('이미 가입된 이메일');
      }
    }
    email = dto.email;
    const newUser = this.userRepository.create({
      username: dto.username,
      email: email,
      user_id: dto.userId,
      password: hashedPassword,
      teacher_character_id: dto.teacherId ?? null,
    });
    return await this.userRepository.save(newUser);
  }

  async findById(id: User['id']): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      return null;
    }
    return user;
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
        throw new UnprocessableEntityException('이미 가입된 이메일');
      }
      email = dto.email;
    }

    const updatedUser = this.userRepository.create({
      ...user,
      email: email,
    });
    // 프론트는 teacherId 로 보내지만 실제 컬럼은 teacher_character_id 이므로 명시적으로 매핑합니다.
    // (예전 ...dto spread 방식은 teacherId 키가 컬럼과 달라 무시되어 저장되지 않았습니다)
    if (dto.teacherId !== undefined && dto.teacherId !== null) {
      updatedUser.teacher_character_id = Number(dto.teacherId);
    }
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  // xp를 증가시키고, 필요시 레벨업합니다.
  // 가능하면 연쇄 레벨업도 처리 (예: xp 15 증가 → 레벨업 2번).
  async updateLevel(id: User['id'], xpGain: number): Promise<void> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return;

    let level = user.level;
    let xp = Math.max(0, user.level_xp ?? 0) + xpGain;

    // 연쇄 레벨업: xp가 xpRequired 이상이면 계속 레벨업
    while (true) {
      const xpRequired = getXpRequired(level);
      if (xp >= xpRequired) {
        xp -= xpRequired;
        level += 1;
      } else {
        break;
      }
    }

    // 변경사항 저장
    if (user.level !== level || user.level_xp !== xp) {
      await this.userRepository.update(id, {
        level,
        level_xp: xp,
      });
    }
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
