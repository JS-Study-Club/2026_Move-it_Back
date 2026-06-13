import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayloadType } from '@/auth/utils/types/jwt-payload.type';
// TODO : 토큰 검사, 유저 정보 검증, req.user에 정보 전달

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      // accessToken 은 httpOnly 쿠키로 전달됩니다(사용자 JS 접근 차단).
      // Swagger 등에서의 테스트를 위해 Authorization 헤더도 fallback 으로 둡니다.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwtTokenSecret'),
    });
  }

  public validate(payload: JwtPayloadType): JwtPayloadType {
    // return { id: payload.sub, userId: payload.userId };
    return payload;
  }
}
