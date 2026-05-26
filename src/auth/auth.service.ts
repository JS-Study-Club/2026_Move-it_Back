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
import crypto, { UUID } from 'crypto';
import { JwtPayloadType } from '@/utils/types/jwt-payload.type';
import { JwtRefreshPayloadType } from '@/utils/types/jwt-refresh-payload.type';

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
    const { accessPayload, refreshPayload } = this.getPayloadsData(user.id);
    const { token, refreshToken, tokenExpires } = await this.getTokensData(
      accessPayload,
      refreshPayload,
    );
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

  async refreshToken(
    id: number,
    currentRefreshToken: string,
  ): Promise<RefreshResDto> {
    const user = await this.userService.findById(id);
    if (user === null || !user.refreshToken) {
      throw new UnauthorizedException('로그아웃 혹은 존재하지 않는 사용자');
    }
    const isRefreshTokenMatch = await bcrypt.compare(
      currentRefreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenMatch) {
      throw new UnauthorizedException('다시 로그인 해주세요'); // 잘못된 리프레시 토큰
    }

    const { accessPayload, refreshPayload } = this.getPayloadsData(user.id);
    const {
      token: newToken,
      refreshToken: newRefreshToken,
      tokenExpires,
    } = await this.getTokensData(accessPayload, refreshPayload);

    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, salt);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken: newToken,
      refreshToken: hashedRefreshToken,
      tokenExpires: tokenExpires,
    };
  }

  async logout(id: number) {
    await this.userService.updateRefreshToken(id, null);
    return { message: '로그아웃 성공' };
  }

  private async getTokensData(
    accessPayload: JwtPayloadType,
    refreshPayload: JwtRefreshPayloadType,
  ) {
    const tokenExpiresIn = this.configService.getOrThrow<string>(
      'auth.jwtTokenExpires',
    ) as any;
    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('auth.jwtTokenSecret'),
        expiresIn: tokenExpiresIn,
      }),
      await this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>(
          'auth.jwtRefreshTokenSecret',
        ),
        expiresIn: this.configService.getOrThrow<string>(
          'auth.jwtRefreshExpires',
        ) as any,
      }),
    ]);
    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  private getPayloadsData(id: User['id']) {
    const nSession = crypto.randomUUID() as UUID;
    const accessPayload = { id: id };
    const refreshPayload = {
      id: id,
      sessionId: nSession,
      hash: crypto.createHash('sha256').update(nSession).digest('hex'),
    };
    return {
      accessPayload,
      refreshPayload,
    };
  }
}
