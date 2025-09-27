import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/User';
import { Workshop } from '../entities/Workshop';
import { Payment } from '../entities/Payment';
import { Enrollment } from '../entities/Enrollment';
import { StudentProfile } from '../entities/StudentProfile';
import { AuditLog } from '../entities/AuditLog';
import { StatsService } from './stats.service';
import { ExportService } from './export.service';
import { AuditLogService } from './audit-log.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workshop, Payment, Enrollment, StudentProfile, AuditLog])],
  controllers: [AdminController],
  providers: [StatsService, ExportService, AuditLogService],
  exports: [StatsService]
})
export class AdminModule {}
