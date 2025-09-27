import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from '../entities/Workshop';
import { Enrollment } from '../entities/Enrollment';
import { User } from '../entities/User';
import { WorkshopService } from './workshop.service';
import { EnrollmentService } from './enrollment.service';
import { WorkshopController } from './workshop.controller';
import { QrService } from './qr/qr.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workshop, Enrollment, User]),
    NotificationsModule
  ],
  controllers: [WorkshopController],
  providers: [WorkshopService, EnrollmentService, QrService],
  exports: [WorkshopService, EnrollmentService],
})
export class WorkshopsModule {}
