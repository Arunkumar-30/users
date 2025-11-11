import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // allow frontend at port 3000
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://0.0.0.0:${port}`);
}
bootstrap();

