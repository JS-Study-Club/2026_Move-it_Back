import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UnauthorizedException, 
  Res, Req,
  UseGuards,
  Response, Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from "./dto/login-user.dto";
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
// import { AuthGuard } from 

// TODO : @nestjs/swagger ApiTag처리

@Controller('api/v1/auth')
export class AuthController{
  constructor(private readonly authService: AuthService) {}
  
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{token:string, refreshToken:string, tokenExpires:Date}> {
    const user = await this.authService.validateUser( // todo; pipe
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDTO: CreateUserDto) {
    return await this.authService.signup(signupDTO);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: any){
    // TODO: 로그아웃 관련 로직
    return this.authService.logout(req);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: any){
    return this.authService.refresh(req.user);
  }

}
