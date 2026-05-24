import { HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from '@/user/dto/create-user.dto';
import { User } from "./entities/user.entitiy";
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  // private readonly jwtService: JwtService;

  // async signup(dto: SignupDto): Promise<void>{
  //     const user = await this.userRepository.create({
  //         ...dto // TODO: 추후 이외 데이터 추가
  //     }); 
  //     const hPassword = await this.jwtService.signAsync({
  //         confirm: user.id,{
  //             secret: this.config
  //         }
  //     });
  // }
  async create(dto: CreateUserDto): Promise<User>{
    let hashedPassword: string|undefined = undefined;
    if(dto.password){ // TODO : validation pipe (pw, id, email 등등)
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(dto.password, salt);
    }

    let email: string|null = null;
    if(dto.email){
      const userObj = await this.userRepository.findOneBy({email: dto.email});
      if(userObj) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: '이미 가입된 이메일'
          },
        });
      }
      email = dto.email;
    }
    const newUser = this.userRepository.create({
      ...dto,
      password: hashedPassword
    });
    return await this.userRepository.save(newUser);
  }

  save(user: User){
    return this.userRepository.save(user);
  }

  findOne(id: User['id']): Promise<User|null>{
    return this.userRepository.findOneBy({id});
  }

  async updateRefreshToken(id: User['id'], newRefreshToken: string): Promise<void> {
    // throw new Error('Method not implemented.');
    const user = await this.userRepository.findOneBy({id});
    if(!user) throw new NotFoundException("유저정보 없음 : 리프레시 토큰");
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, await bcrypt.genSalt());
    await this.userRepository.update(id, {
      refreshToken: hashedRefreshToken
    });
  }
  
  async update(id: User['id'], dto: UpdateUserDto): Promise<User|null>{
    // TODO : teacherId 유효성 검사
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
      const userObject = await this.userRepository.findOneBy({email:dto.email});
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
      password: password
    });
    return await this.userRepository.save(updatedUser);
  }
}
