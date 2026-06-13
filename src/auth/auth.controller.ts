import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import express from 'express';
// import { AuthGuard } from

@ApiTags('Auth')
@Controller({ path: '/auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 인증 토큰은 모두 httpOnly 쿠키로만 전달해 클라이언트 JS(사용자)가 접근할 수 없게 합니다.
  private readonly isProd = process.env?.NODE_ENV === 'prod';

  private setAccessTokenCookie(res: express.Response, accessToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
    });
  }

  private setRefreshTokenCookie(res: express.Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms, 7d
    });
  }

  private clearAuthCookies(res: express.Response) {
    // set 할 때와 동일한 옵션을 줘야 브라우저가 정확히 매칭해 삭제합니다.
    const opts = {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax' as const,
      path: '/',
    };
    res.clearCookie('accessToken', opts);
    res.clearCookie('refreshToken', opts);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResDto })
  async login(
    @Body() loginDto: LoginReqDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<LoginResDto> {
    const { user, accessToken, refreshToken, tokenExpires } =
      await this.authService.login(loginDto);
    // accessToken 도 body 가 아니라 httpOnly 쿠키로 내려 사용자에게 노출하지 않습니다.
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
    return { user, tokenExpires };
  }

  @Post('signup')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signup(@Body() createUserDto: RegisterReqDto) {
    return await this.authService.register(createUserDto);
  }

  // @Post('forgot/password')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async forgotPassword(@Body() forgotPwDto: AuthForgotPwDto): Promise<void> {
  //   return this.authService.forgotPassword(forgotPwDto.email);
  // }

  // @Post('reset/password')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // resetPassword(@Body() resetPwDto: AuthResetPwDto): Promise<void> {
  //   return this.authService.resetPassword(resetPwDto.hash, resetPwDto.password);
  // }

  @Post('refresh')
  @ApiOperation({ summary: '클라이언트 토큰 재요청 (인증 만료 시)' })
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async refresh(
    @Request() request: any,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    // jwt-refresh 전략이 refreshToken 쿠키를 검증하고 payload 를 request.user 에 실어줍니다.
    const userId = request.user.id;
    const currentRefreshToken = request.cookies?.refreshToken;

    const { accessToken, refreshToken } = await this.authService.refreshToken(
      userId,
      currentRefreshToken,
    );
    // 새 access/refresh 토큰을 다시 httpOnly 쿠키로 심어 줍니다(회전).
    this.setAccessTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @Request() request: any,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<void> {
    await this.authService.logout(request.user.id);
    // 로그인 시 심은 access/refresh 쿠키를 모두 제거합니다.
    this.clearAuthCookies(res);
  }
}
