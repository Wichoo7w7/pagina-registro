import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../entities/Payment';
import { User } from '../entities/User';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentEventsListener } from './listeners/payment-events.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User]), AuthModule, NotificationsModule],
  providers: [PaymentsService, PaymentEventsListener],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
