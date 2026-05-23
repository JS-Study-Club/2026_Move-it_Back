import { Injectable } from '@nestjs/common';
import { User } from "./entities/user.entitiy";
import { UserRepository } from './user.repository';
import * as bcrypt from "bcrypt";
import { CreateUserDto } from '@/auth/dto/create-user.dto';

@Injectable()
export class UserService {
    
    private readonly userRepository: UserRepository;
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
    async create(dto: CreateUserDto){
        const hashedPassword = await bcrypt.hash(dto.password, "SALT_OR_ROUNDS");
        await this.userRepository.create({
            
        });
        await this.userRepository.save();
    }

    async save(user: User){
        return await this.userRepository.save(user);
    }

    async findOne(id: User['id']): Promise<User|null>{
        const user = await this.userRepository.findById(id);
        // const userRes = plainToInstance(UserResponseDto, user);
        return user;
    }

    async findByName(username:string): Promise<User|null> {
        return this.userRepository.findByName(username);
    }

    updateRefreshToken(id: any, newRefreshToken: string) {
        // throw new Error('Method not implemented.');
        return this.userRepository.updateRefreshToken(id, string);
    }
}
