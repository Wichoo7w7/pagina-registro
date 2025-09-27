import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { User } from '../entities/User';
import { Payment } from '../entities/Payment';
import { Workshop } from '../entities/Workshop';
import { Enrollment } from '../entities/Enrollment';
import { stringify } from 'csv-stringify/sync';
import ExcelJS from 'exceljs';

interface ExportFilters {
  from?: Date;
  to?: Date;
  status?: string; // payments
}

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Workshop) private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  private buildDateRange(filters: ExportFilters, field: string) {
    if (filters.from && filters.to) return { [field]: Between(filters.from, filters.to) };
    if (filters.from) return { [field]: MoreThanOrEqual(filters.from) };
    if (filters.to) return { [field]: LessThanOrEqual(filters.to) };
    return {};
  }

  async export(entity: string, format: 'csv' | 'xlsx', filters: ExportFilters): Promise<{ filename: string; mime: string; buffer: Buffer; }> {
    switch (entity) {
      case 'users': return this.exportUsers(format, filters);
      case 'payments': return this.exportPayments(format, filters);
      case 'workshops': return this.exportWorkshops(format, filters);
      case 'enrollments': return this.exportEnrollments(format, filters);
      default: throw new BadRequestException('Entidad no soportada');
    }
  }

  private async exportUsers(format: 'csv' | 'xlsx', filters: ExportFilters) {
    const where = this.buildDateRange(filters, 'createdAt');
    const rows = await this.userRepo.find({ where });
  const data = rows.map((u: User) => ({ id: u.id, email: u.email, isVerified: u.isVerified, createdAt: u.createdAt.toISOString() }));
    return this.formatData('users', data, format);
  }

  private async exportPayments(format: 'csv' | 'xlsx', filters: ExportFilters) {
    const base = this.buildDateRange(filters, 'createdAt');
    const where: any = { ...base };
    if (filters.status) where.status = filters.status;
    const rows = await this.paymentRepo.find({ where });
  const data = rows.map((p: Payment) => ({ id: p.id, boletaNumber: p.boletaNumber, status: p.status, createdAt: p.createdAt.toISOString() }));
    return this.formatData('payments', data, format);
  }

  private async exportWorkshops(format: 'csv' | 'xlsx', filters: ExportFilters) {
    const where = this.buildDateRange(filters, 'createdAt');
    const rows = await this.workshopRepo.find({ where });
  const data = rows.map((w: Workshop) => ({ id: w.id, nombre: w.nombre, cupoMaximo: w.cupoMaximo, cuposDisponibles: w.cuposDisponibles, activo: w.activo }));
    return this.formatData('workshops', data, format);
  }

  private async exportEnrollments(format: 'csv' | 'xlsx', filters: ExportFilters) {
    const where = this.buildDateRange(filters, 'createdAt');
    const rows = await this.enrollmentRepo.find({ where });
  const data = rows.map((e: Enrollment) => ({ id: e.id, workshop: e.workshop.nombre, user: e.user.email, attendance: e.attendance, enrollmentDate: e.enrollmentDate.toISOString() }));
    return this.formatData('enrollments', data, format);
  }

  private async formatData(prefix: string, data: any[], format: 'csv' | 'xlsx') {
    if (format === 'csv') {
      const header = Object.keys(data[0] || {});
      const records = data.map(d => header.map(h => (d as any)[h]));
      const csv = stringify([header, ...records], { delimiter: ',', bom: true });
      return { filename: `${prefix}.csv`, mime: 'text/csv', buffer: Buffer.from(csv, 'utf8') };
    }
    // XLSX
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('data');
    if (data.length) {
      sheet.columns = Object.keys(data[0]).map(k => ({ header: k, key: k }));
      data.forEach(row => sheet.addRow(row));
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return { filename: `${prefix}.xlsx`, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(buffer) };
  }
}
