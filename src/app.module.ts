import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChallengeModule } from './challenge/challenge.module';
import { PracticeModule } from './practice/practice.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import configuration from './config/configuration';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { JwtRefreshStrategy } from './auth/strategy/jwt-refresh.strategy';
import { PagesModule } from './pages/pages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        schema: configService.get<string>('DB_SCHEMA'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UserModule,
    ChallengeModule,
    PracticeModule,
    PagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // 전역 필터로 사용할 클래스 지정
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    JwtStrategy,
    JwtRefreshStrategy,
  ],
})
export class AppModule {}
