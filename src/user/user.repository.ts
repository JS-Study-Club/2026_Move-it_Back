import { Injectable } from '@nestjs/common';
import { User } from "./entities/user.entitiy";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository{
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    // TODO : null 반환 안정화

    async findById(id: User['id']): Promise<User|null> {
        const user = await this.userRepository.findOne({
            where: { id: Number(id) },
        });
        return user??null;
    }

    async findByName(username: string): Promise<User|null>{
        if(!username) return null;
        return await this.userRepository.findOne({
            where: { username: username }
        }) ?? null;
    }

    async save(user: any){
        return await this.userRepository.save(user);
    }

    async create(userInfo: any): Promise<User>{
        return this.userRepository.create(userInfo);
    }

}