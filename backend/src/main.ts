import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: true,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });

    // Rate limiting guard global
    app.useGlobalGuards(app.get(ThrottlerGuard));

    const config = app.get(ConfigService);
    const port = config.get<number>('PORT') || 3000;
    
    await app.listen(port);
    console.log(`API escuchando en puerto ${port}`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, closing server gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, closing server gracefully...');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error starting application:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
