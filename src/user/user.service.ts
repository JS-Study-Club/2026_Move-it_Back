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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      email = dto.email;
    }
    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });
    return await this.userRepository.save(newUser);
  }

  save(user: User) {
    return this.userRepository.save(user);
  }

  findById(id: User['id']): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  findByUserId(userId: User['user_id']): Promise<User | null> {
    return this.userRepository.findOneBy({ user_id: userId });
  }

  findByEmail(email: User['email']): Promise<User | null> {
    return this.userRepository.findOneBy({ email: email });
  }

  async update(id: User['id'], dto: UpdateUserDto): Promise<UserResDto | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    let password = user.password;
    if (dto.password) {
      const isPwSame = await bcrypt.compare(dto.password, user.password);
      if (!isPwSame) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(dto.password, salt);
      }
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
      password: password,
    });
    await this.userRepository.save(updatedUser);
    return plainToInstance(UserResDto, { ...updatedUser });
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

  async me(id: User['id']): Promise<UserResDto> {
    const user = await this.userRepository.findOneByOrFail({ id });
    return plainToInstance(UserResDto, { ...user });
  }
}
