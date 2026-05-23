import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import * as bcrypt from "bcrypt";
import { JwtService } from 'node_modules/@nestjs/jwt';
import { ConfigService } from 'node_modules/@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from '@/user/user.repository';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ){};

    async validateUser(username:string, password:string){ // TODO : 매개변수 형 변환 확인
        const user = await this.userService.findByName(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            console.log(user);
            return result;
        } else {
            throw new UnauthorizedException({error: "Incorrect username | password"});
        }
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };
        
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m'
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d'
        });
        // await this.updateRefreshTokenInDB(user.id, refreshToken); //DB 저장 필수 ;;

        return { token, refreshToken, tokenExpires: new Date(Date.now() + 15 * 60 * 1000) };
        // return { access_token: this.jwtService.sign(payload)}
    }

    async refresh(user: any){
        const currentUser = await this.userService.findOne(user.id);
        if(currentUser===null || !currentUser?.refreshToken) throw new UnauthorizedException("이미 로그아웃된 사용자");

        const payload = { username: user.username, sub: user.id };
        const newToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m'
        });
        const newRefreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d'
        });
        await this.userService.updateRefreshToken(user.id, newRefreshToken);
        return { token: newToken, refreshToken: newRefreshToken };
    }

    async signup(dto: CreateUserDto): Promise<void> {
        const user = this.userService.create(dto);
    }

    async logout(user: any){
        await this.userService.updateRefreshToken(user.id, null);
        return {message: "로그아웃 성공"}
    }
}
