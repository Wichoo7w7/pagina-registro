import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ExportService } from './export.service';
import { AuditLogService } from './audit-log.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard, RolesGuard, ThrottlerGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly statsService: StatsService,
    private readonly exportService: ExportService,
    private readonly audit: AuditLogService,
  ) {}

  @Get('stats/general')
  @Throttle({ default: { limit: 20, ttl: 60 } })
  async general() {
    const data = await this.statsService.getGeneralStats();
    await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'general' } });
    return data;
  }

  @Get('stats/payments')
  async payments() {
    const data = await this.statsService.getPaymentStats();
    await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'payments' } });
    return data;
  }

  @Get('stats/workshops')
  async workshops() {
    const data = await this.statsService.getWorkshopStats();
    await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'workshops' } });
    return data;
  }

  @Get('stats/users')
  async users() {
    const data = await this.statsService.getUserStats();
    await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'users' } });
    return data;
  }

  @Get('export/:entity')
  async export(
    @Param('entity') entity: string,
    @Res() res: Response,
    @Query('format') format?: 'csv' | 'xlsx',
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
  ) {
    const filters = {
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      status,
    };
  const fmt: 'csv' | 'xlsx' = (format === 'xlsx') ? 'xlsx' : 'csv';
  const result = await this.exportService.export(entity, fmt, filters);
  await this.audit.log({ entity, action: 'export', details: { format: fmt, ...filters } });
    res.setHeader('Content-Type', result.mime);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.send(result.buffer);
  }
}
