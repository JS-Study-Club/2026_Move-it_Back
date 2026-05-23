import { Injectable } from '@nestjs/common';
import { User } from "./entities/user.entitiy";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
        return await this.userRepository.findOneBy({id});
    }

    updateRefreshToken(id: any, newRefreshToken: string) {
        // throw new Error('Method not implemented.');
        return this.userRepository.updateRefreshToken(id, string);
    }
}
