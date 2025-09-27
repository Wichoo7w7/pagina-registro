import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Payment, PaymentStatus } from '../entities/Payment';
import { User } from '../entities/User';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { PAYMENT_EVENTS } from './events/payment-events.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuid } from 'uuid';

interface FindAllFilters { status?: PaymentStatus; userId?: string; dateFrom?: string; dateTo?: string; }

@Injectable()
export class PaymentsService {
  private uploadDir = path.resolve('uploads', 'payments');

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private events: EventEmitter2
  ) {
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  private buildQuery(filters: FindAllFilters): SelectQueryBuilder<Payment> {
    let qb = this.paymentRepo.createQueryBuilder('p').leftJoinAndSelect('p.user', 'user');
    if (filters.status) qb = qb.andWhere('p.status = :status', { status: filters.status });
    if (filters.userId) qb = qb.andWhere('user.id = :userId', { userId: filters.userId });
    if (filters.dateFrom) qb = qb.andWhere('p.boletaDate >= :dateFrom', { dateFrom: filters.dateFrom });
    if (filters.dateTo) qb = qb.andWhere('p.boletaDate <= :dateTo', { dateTo: filters.dateTo });
    qb = qb.orderBy('p.createdAt', 'DESC');
    return qb;
  }

  async createPayment(userId: string, dto: CreatePaymentDto, file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    // Validación básica de tipo
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.mimetype)) throw new BadRequestException('Tipo de archivo no permitido');
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('Archivo excede 5MB');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Nombre seguro
    const ext = path.extname(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.bin');
    const safeName = `${uuid()}${ext}`;
    const destPath = path.join(this.uploadDir, safeName);
    fs.writeFileSync(destPath, file.buffer);

    const existing = await this.paymentRepo.findOne({ where: { boletaNumber: dto.boletaNumber } });
    if (existing) throw new BadRequestException('Boleta ya registrada');

    const payment = this.paymentRepo.create({
      boletaNumber: dto.boletaNumber,
      boletaDate: dto.boletaDate,
      boletaImage: destPath,
      status: PaymentStatus.PENDING,
      user
    });
    return this.paymentRepo.save(payment);
  }

  async findAll(filters: FindAllFilters) {
    return this.buildQuery(filters).getMany();
  }

  async findUserPayments(userId: string) {
    return this.paymentRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  async approvePayment(paymentId: string, adminId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: ['user'] });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (payment.status === PaymentStatus.APPROVED) return payment;
    payment.status = PaymentStatus.APPROVED;
    payment.rejectionReason = null as any;
    const saved = await this.paymentRepo.save(payment);
    this.events.emit(PAYMENT_EVENTS.APPROVED, { userEmail: payment.user.email, boletaNumber: payment.boletaNumber });
    return saved;
  }

  async rejectPayment(paymentId: string, dto: UpdatePaymentStatusDto, adminId: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: ['user'] });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    if (dto.status !== PaymentStatus.REJECTED) throw new BadRequestException('Status debe ser rejected');
    payment.status = PaymentStatus.REJECTED;
    payment.rejectionReason = dto.rejectionReason || null;
    const saved = await this.paymentRepo.save(payment);
    this.events.emit(PAYMENT_EVENTS.REJECTED, { userEmail: payment.user.email, boletaNumber: payment.boletaNumber, reason: payment.rejectionReason });
    return saved;
  }
}
