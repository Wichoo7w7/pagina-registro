import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from '../entities/EmailLog';
import { EmailService } from './services/email.service';
import { TemplateService } from './services/template.service';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([EmailLog]),
    BullModule.registerQueueAsync({
      name: 'emails',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: parseInt(config.get<string>('REDIS_PORT','6379'), 10),
          password: config.get<string>('REDIS_PASSWORD') || undefined
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: 1000,
          removeOnFail: false
        }
      })
    })
  ],
  providers: [EmailService, TemplateService, EmailProcessor],
  exports: [EmailService]
})
export class NotificationsModule {}
