import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from '@/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@/user/entities/user.entity';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import ms from 'ms';
import { RefreshResDto } from './dto/refresh.res.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signIn(loginDto: LoginReqDto): Promise<LoginResDto> {
    const user = await this.userService.findByUserId(loginDto.userId);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        erorr: {
          userId: 'not found',
        },
      });
    }
    if (!user.password) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'empty pw',
        },
      });
    }
    const isPasswordValid =
      user && (await bcrypt.compare(loginDto.password, user.password));
    if (!isPasswordValid) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: 'incorrect pw',
        },
      });
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
    });
    return {
      id: user.id,
      refreshToken,
      token,
      tokenExpires,
    };
  }

  async register(dto: RegisterReqDto): Promise<void> {
    // const user = await this.userService.create({
    //   userId: dto.userId,
    //   userName: dto.userName,
    //   email: dto.email,
    //   password: dto.password,
    //   teacherId: dto.teacherId,
    // });
    const existingUser = await this.userService.findByUserId(dto.userId);
    if (existingUser) {
      throw new ConflictException('이미 가입된 아이디입니다');
    }
    // const user = await this.userService.create({
    //   ...dto,
    // });
    const user = await this.userService.create({
      ...dto,
    });

    await this.jwtService.signAsync(
      { sub: user!.id, username: user!.user_id },
      {
        secret: this.configService.getOrThrow('auth.jwtTokenSecret'),
        expiresIn: this.configService.getOrThrow('auth.jwtTokenExpires'),
      },
    );
  }

  async refreshToken(id: number): Promise<RefreshResDto> {
    const user = await this.userService.findById(id);
    if (user === null || !user?.refreshToken)
      throw new UnauthorizedException('이미 로그아웃된 사용자');

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
    });
    const isRefreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenMatch) {
      throw new UnauthorizedException('잘못된 리프레시 토큰');
    }

    const payload = { sub: user.id };
    const newToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('auth.jwtTokenSecret'),
      expiresIn: this.configService.getOrThrow('auth.jwtTokenExpires'),
    });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('auth.jwtRefreshTokenSecret'),
      expiresIn: this.configService.getOrThrow('auth.jwtRefreshTokenExpires'),
    });
    await this.userService.updateRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newToken,
      refreshToken: newRefreshToken,
      tokenExpires: tokenExpires,
    };
  }

  async logout(id: number) {
    await this.userService.updateRefreshToken(id, null);
    return { message: '로그아웃 성공' };
  }

  private async getTokensData(data: { id: User['id'] }) {
    const tokenExpiresIn = this.configService.getOrThrow(
      'auth.jwtTokenExpires',
    );
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        { id: data.id },
        {
          secret: this.configService.getOrThrow('auth.jwtTokenSecret'),
          expiresIn: tokenExpiresIn,
        },
      ),
      await this.jwtService.signAsync(
        { id: data.id },
        {
          secret: this.configService.getOrThrow('auth.jwtRefreshTokenSecret'),
          expiresIn: this.configService.getOrThrow('auth.jwtRefreshExpires'),
        },
      ),
    ]);
    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
