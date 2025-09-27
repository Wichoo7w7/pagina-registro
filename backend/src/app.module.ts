import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { StudentProfile } from './entities/StudentProfile';
import { Role } from './entities/Role';
import { Payment } from './entities/Payment';
import { Workshop } from './entities/Workshop';
import { Enrollment } from './entities/Enrollment';
import { AuthModule } from './auth/auth.module';
import { PaymentsModule } from './payments/payments.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailLog } from './entities/EmailLog';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{
        ttl: config.get<number>('THROTTLE_TTL', 60),
        limit: config.get<number>('THROTTLE_LIMIT', 20)
      }]
    }),
    EventEmitterModule.forRoot({
      delimiter: '.',
      wildcard: false,
      maxListeners: 20
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USER', 'app_user'),
        password: config.get<string>('DB_PASSWORD', 'app_password_change_me'),
        database: config.get<string>('DB_NAME', 'app_db'),
  entities: [User, StudentProfile, Role, Payment, Workshop, Enrollment, EmailLog],
        synchronize: false,
        logging: config.get<string>('TYPEORM_LOGGING') === 'true'
      })
    }),
    AuthModule,
    PaymentsModule,
    WorkshopsModule,
    AdminModule,
    NotificationsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
