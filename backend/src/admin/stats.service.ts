import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { Workshop } from '../entities/Workshop';
import { Payment, PaymentStatus } from '../entities/Payment';
import { Enrollment } from '../entities/Enrollment';
import { StudentProfile } from '../entities/StudentProfile';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Workshop) private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(StudentProfile) private readonly profileRepo: Repository<StudentProfile>,
  ) {}

  async getGeneralStats() {
    const [users, workshops, payments, enrollments] = await Promise.all([
      this.userRepo.count(),
      this.workshopRepo.count(),
      this.paymentRepo.count(),
      this.enrollmentRepo.count(),
    ]);
    return { users, workshops, payments, enrollments };
  }

  async getPaymentStats(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const all = await this.paymentRepo.find({ where: { createdAt: since }, order: { createdAt: 'ASC' } });
    // Mejor usar QueryBuilder para agrupar; aquí un enfoque simple para ilustrar
    const distribution: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
    const timeSeries: { date: string; count: number; approved: number; rejected: number }[] = [];
    const bucket: Record<string, { count: number; approved: number; rejected: number }> = {};
    const list = await this.paymentRepo.find();
  list.forEach((p: Payment) => {
      distribution[p.status] = (distribution[p.status] || 0) + 1;
      const d = new Date(p.createdAt).toISOString().slice(0,10);
      bucket[d] = bucket[d] || { count: 0, approved: 0, rejected: 0 };
      bucket[d].count++;
      if (p.status === PaymentStatus.APPROVED) bucket[d].approved++;
      if (p.status === PaymentStatus.REJECTED) bucket[d].rejected++;
    });
    Object.entries(bucket).sort().forEach(([date, v]) => timeSeries.push({ date, ...v }));
    return { distribution, timeSeries };
  }

  async getWorkshopStats() {
    const workshops = await this.workshopRepo.find();
    const enrollments = await this.enrollmentRepo.find();
    const perWorkshop = workshops.map((w: Workshop) => {
      const count = enrollments.filter((e: Enrollment) => e.workshop.id === w.id).length;
      const used = w.cupoMaximo - w.cuposDisponibles;
      return {
        id: w.id,
        nombre: w.nombre,
        inscritos: count,
        cuposUsados: used,
        cupoMaximo: w.cupoMaximo,
        ocupacion: Number((used / w.cupoMaximo).toFixed(2)),
      };
    });
    return { perWorkshop };
  }

  async getUserStats() {
    const users = await this.userRepo.find();
    const profiles = await this.profileRepo.find();
    const byDate: Record<string, number> = {};
  users.forEach((u: User) => {
      const d = new Date(u.createdAt).toISOString().slice(0,10);
      byDate[d] = (byDate[d] || 0) + 1;
    });
    const facultyCount: Record<string, number> = {};
  profiles.forEach((p: StudentProfile) => {
      facultyCount[p.facultad] = (facultyCount[p.facultad] || 0) + 1;
    });
    const dateSeries = Object.entries(byDate).sort().map(([date, count]) => ({ date, count }));
    const faculties = Object.entries(facultyCount).sort((a,b) => b[1]-a[1]).map(([facultad, count]) => ({ facultad, count }));
    return { dateSeries, faculties };
  }
}
