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
import { RegisterReqDto } from './dto/register.req.dto';
import ms from 'ms';
import { RefreshResDto } from './dto/refresh.res.dto';
import crypto, { UUID } from 'crypto';
import { JwtPayloadType } from '@/auth/utils/types/jwt-payload.type';
import { JwtRefreshPayloadType } from '@/auth/utils/types/jwt-refresh-payload.type';
import { AuthUserDto } from './dto/login.res.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginReqDto): Promise<LoginResult> {
    const user = await this.userService.findByUserId(loginDto.userId);
    if (!user) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          userId: '존재하지 않는 아이디입니다.',
        },
      });
    }
    if (!user.password || user.password === undefined) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: '비밀번호가 설정되지 않은 계정입니다.',
        },
      });
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password.trim(),
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          password: '비밀번호가 올바르지 않습니다.',
        },
      });
    }
    const { accessPayload, refreshPayload } = this.getPayloadsData(user.id);
    const { token, refreshToken, tokenExpires } = await this.getTokensData(
      accessPayload,
      refreshPayload,
    );

    // 프론트엔드가 기대하는 camelCase 형태로 명시적으로 매핑합니다.
    // (UserResDto 의 @Expose({ name }) 가 원본 키로 되돌아가는 문제 회피 + 민감정보 미노출)
    const userPayload: AuthUserDto = {
      userId: user.user_id,
      username: user.username,
      teacherId: user.teacher_character_id,
      level: user.level,
      levelXp: user.level_xp,
      levelTitle: user.levelInfo?.levelTitle ?? '',
    };

    return {
      user: userPayload,
      accessToken: token,
      refreshToken: refreshToken,
      tokenExpires: tokenExpires,
    };
  }

  async register(dto: RegisterReqDto): Promise<void> {
    // user_id 는 unique 이므로, 이미 존재하면 아이디 중복으로 처리합니다.
    const existingUser = await this.userService.findByUserId(dto.userId);
    if (existingUser) {
      throw new ConflictException({ message: '이미 사용 중인 아이디입니다' });
    }
    // 이메일 중복은 userService.create 내부에서 검증/예외 처리됩니다.
    await this.userService.create({
      username: dto.username,
      email: dto.email,
      userId: dto.userId,
      password: dto.password,
      teacherId: dto.teacherId,
    });
  }

  async refreshToken(
    // TODO : 무겁다면 레디스로 리팩토링
    id: User['id'],
    currentRefreshToken: string,
  ): Promise<RefreshResDto> {
    const user = await this.userService.findById(id);
    if (user === null) {
      throw new UnauthorizedException({
        message: '로그아웃 혹은 존재하지 않는 사용자',
      });
    }
    const dbRfToken = await this.userService.findRefreshTokenById(id);
    if (!dbRfToken) {
      throw new UnauthorizedException(
        '인증 세션이 만료되었습니다. 다시 로그인해주세요.',
      );
    }
    const isRefreshTokenMatch = bcrypt.compare(currentRefreshToken, dbRfToken);

    if (!isRefreshTokenMatch) {
      throw new UnauthorizedException({ message: '다시 로그인 해주세요' }); // 잘못된 리프레시 토큰
    }

    const { accessPayload, refreshPayload } = this.getPayloadsData(id);
    const { refreshToken: newRefreshToken } = await this.getTokensData(
      accessPayload,
      refreshPayload,
    );

    const salt = await bcrypt.genSalt();
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, salt);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      refreshToken: hashedRefreshToken,
    };
  }

  async logout(id: User['id']) {
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
          'auth.jwtRefreshTokenExpires',
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

interface LoginResult {
  user: AuthUserDto;
  accessToken: string;
  refreshToken: string;
  tokenExpires: string;
}
