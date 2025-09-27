import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../entities/Enrollment';
import { Workshop } from '../entities/Workshop';
import { User } from '../entities/User';
import { QrService } from './qr/qr.service';
import { v4 as uuid } from 'uuid';
import { EmailService } from '../notifications/services/email.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Workshop) private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly qrService: QrService,
    private readonly emailService: EmailService,
  ) {}

  async createEnrollment(userId: string, workshopId: string): Promise<Enrollment> {
    const workshop = await this.workshopRepo.findOne({ where: { id: workshopId, activo: true } });
    if (!workshop) throw new NotFoundException('Taller no encontrado o inactivo');

    if (workshop.cuposDisponibles <= 0) {
      throw new BadRequestException('No hay cupos disponibles');
    }

    // Validar que el usuario no esté ya inscrito
    const existing = await this.enrollmentRepo.findOne({ where: { user: { id: userId }, workshop: { id: workshopId } } });
    if (existing) throw new BadRequestException('Ya inscrito en el taller');

    // TODO: Validar pago aprobado (se necesitaría enlazar Payment con Workshop si aplica)

    const enrollment = new Enrollment();
    enrollment.enrollmentDate = new Date();
    enrollment.user = { id: userId } as User;
    enrollment.workshop = { id: workshopId } as Workshop;

    // Generar base qr code
    enrollment.qrCode = uuid();

    const payload = { eid: enrollment.qrCode, uid: userId, ws: workshopId, ts: Date.now() };
    const token = await this.qrService.generateEncryptedPayload(payload);
    enrollment.qrToken = token;

  const saved = await this.enrollmentRepo.save(enrollment);

    // Actualizar cupos
    workshop.cuposDisponibles -= 1;
    await this.workshopRepo.save(workshop);

    // Enviar correo de confirmación (best-effort, no bloquear la respuesta)
    try {
      // Obtener datos mínimos del usuario y del workshop para personalizar
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (user) {
        const displayName = user.email.split('@')[0];
        this.emailService.sendEnrollmentConfirmationEmail(
          user.email,
          workshop.nombre || 'Taller',
          workshop.fechaInicio ? workshop.fechaInicio.toLocaleDateString('es-GT') : undefined,
          displayName
        );
      }
    } catch (e) {
      // Log silencioso; en un futuro se podría usar un logger central
      // console.error('Error enviando email de inscripción', e);
    }

    return saved;
  }

  async findUserEnrollments(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepo.find({ where: { user: { id: userId } }, order: { enrollmentDate: 'DESC' } });
  }

  async validateQR(token: string): Promise<Enrollment> {
    const payload = await this.qrService.decodeEncryptedPayload(token);
    const qrCode = payload.eid;
    const enrollment = await this.enrollmentRepo.findOne({ where: { qrCode } });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');
    return enrollment;
  }

  async updateAttendance(token: string): Promise<Enrollment> {
    const enrollment = await this.validateQR(token);
    if (enrollment.attendance) {
      throw new BadRequestException('Asistencia ya registrada');
    }
    enrollment.attendance = true;
    enrollment.attendanceAt = new Date();
    return this.enrollmentRepo.save(enrollment);
  }
}
