import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 유효성 검사
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  // Increase body limit for large pose data
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS  app.enableCors({
  const corsOptions = {
    origin: true, // Allow all origins for now. Can be restricted to specific origins later.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 1. Swagger 문서 설정 (DocumentBuilder)
  const config = new DocumentBuilder()
    .setTitle('MoveIt API')
    .setDescription('API 상세 설명')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // 2. Swagger 문서 생성
  const document = SwaggerModule.createDocument(app, config);

  // http://localhost:3000/api-docs)
  SwaggerModule.setup('api-docs', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
