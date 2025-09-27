import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/AuditLog';

@Injectable()
export class AuditLogService {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  async log(params: { entity: string; action: string; performedBy?: string; ipAddress?: string; details?: any; }) {
    const record = this.repo.create({
      entity: params.entity,
      action: params.action,
      performedBy: params.performedBy,
      ipAddress: params.ipAddress,
      details: params.details ?? null,
    });
    return this.repo.save(record);
  }
}
