import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Request,
  Patch,
  Delete,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RefreshResDto } from './dto/refresh.res.dto';
import { LoginReqDto } from './dto/login.req.dto';
import { LoginResDto } from './dto/login.res.dto';
import { RegisterReqDto } from './dto/register.req.dto';
import { RefreshReqDto } from './dto/refresh.req.dto';
import express from 'express';
// import { AuthGuard } from

@ApiTags('Auth')
@Controller({ path: '/auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResDto })
  async login(
    @Body() loginDto: LoginReqDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<LoginResDto> {
    const { user, accessToken, refreshToken, tokenExpires } =
      await this.authService.login(loginDto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env?.NODE_ENV === 'prod' || false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms, 7d
    });
    return { user, accessToken, tokenExpires };
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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOkResponse({ type: RefreshResDto })
  @HttpCode(HttpStatus.OK)
  public async refresh(@Request() request: RefreshReqDto): Promise<void> {
    await this.authService.refreshToken(request.id, request.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Request() request: any): Promise<void> {
    await this.authService.logout(request.user.id);
  }
}
