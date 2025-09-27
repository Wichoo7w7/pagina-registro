import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export enum EmailJobType {
  VERIFICATION = 'verification',
  RESET = 'reset',
  PAYMENT_APPROVED = 'paymentApproved',
  PAYMENT_REJECTED = 'paymentRejected',
  ENROLLMENT = 'enrollment'
}

interface BaseEmailPayload { to: string; subject: string; type: EmailJobType; data: Record<string, any>; }

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);
  constructor(@InjectQueue('emails') private readonly queue: Queue) {}

  private enqueue(payload: BaseEmailPayload) {
    return this.queue.add(payload.type, payload, { priority: 5 });
  }

  sendVerificationEmail(to: string, token: string) {
    return this.enqueue({ to, subject: 'Verificación de cuenta', type: EmailJobType.VERIFICATION, data: { token } });
  }

  sendResetPasswordEmail(to: string, token: string) {
    return this.enqueue({ to, subject: 'Restablecer contraseña', type: EmailJobType.RESET, data: { token } });
  }

  sendPaymentApprovedEmail(to: string, boletaNumber: string) {
    return this.enqueue({ to, subject: 'Pago aprobado', type: EmailJobType.PAYMENT_APPROVED, data: { boletaNumber } });
  }

  sendPaymentRejectedEmail(to: string, boletaNumber: string, reason?: string) {
    return this.enqueue({ to, subject: 'Pago rechazado', type: EmailJobType.PAYMENT_REJECTED, data: { boletaNumber, reason } });
  }

  sendEnrollmentConfirmationEmail(to: string, workshopName: string, startDate?: string, studentName?: string) {
    return this.enqueue({ to, subject: 'Inscripción confirmada', type: EmailJobType.ENROLLMENT, data: { workshopName, startDate, studentName } });
  }
}
