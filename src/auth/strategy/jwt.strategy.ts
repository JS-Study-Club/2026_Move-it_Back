import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from '@/auth/utils/types/jwt-payload.type';
// TODO : 토큰 검사, 유저 정보 검증, req.user에 정보 전달

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.jwtTokenSecret'),
    });
  }

  public validate(payload: JwtPayloadType): JwtPayloadType {
    // return { id: payload.sub, userId: payload.userId };
    return payload;
  }
}
