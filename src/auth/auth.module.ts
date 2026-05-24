import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '@/user/user.service';
import { UserModule } from '@/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    UserModule, PassportModule,
    JwtModule.register({
      // secret: 
      signOptions: {expiresIn: "15m"}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
  exports: [AuthService]
})
export class AuthModule {}
