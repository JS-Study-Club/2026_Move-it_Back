import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

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
