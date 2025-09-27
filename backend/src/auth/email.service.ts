import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

interface EmailJob {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private queue: EmailJob[] = [];
  private processing = false;
  private logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: parseInt(this.config.get<string>('SMTP_PORT', '587'), 10),
      secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASSWORD')
      }
    });
  }

  enqueue(job: EmailJob) {
    this.queue.push(job);
    this.process().catch(e => this.logger.error(e));
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        await this.transporter.sendMail({
          from: this.config.get<string>('EMAIL_FROM'),
          to: job.to,
          subject: job.subject,
          html: job.html
        });
        this.logger.log(`Email enviado a ${job.to}`);
      } catch (err) {
        this.logger.error('Fallo envío email', err as any);
      }
    }
    this.processing = false;
  }

  sendVerificationEmail(to: string, token: string) {
    const link = `${this.config.get('APP_BASE_URL','http://localhost:3000')}/auth/verify-email?token=${token}`;
    const html = `<h1>Verifica tu correo</h1><p>Haz clic <a href="${link}">aquí</a> para verificar tu cuenta. Este enlace expira pronto.</p>`;
    this.enqueue({ to, subject: 'Verificación de cuenta', html });
  }

  sendResetPasswordEmail(to: string, token: string) {
    const link = `${this.config.get('APP_BASE_URL','http://localhost:3000')}/auth/reset-password?token=${token}`;
    const html = `<h1>Restablecer contraseña</h1><p>Haz clic <a href="${link}">aquí</a> para restablecer tu contraseña. Si no solicitaste esto ignora el mensaje.</p>`;
    this.enqueue({ to, subject: 'Restablecer contraseña', html });
  }

  sendPaymentApprovedEmail(to: string, boletaNumber: string) {
    const html = `<h1>Pago Aprobado</h1><p>Tu pago con boleta <strong>${boletaNumber}</strong> ha sido aprobado. Gracias.</p>`;
    this.enqueue({ to, subject: 'Pago aprobado', html });
  }

  sendPaymentRejectedEmail(to: string, boletaNumber: string, reason?: string) {
    const html = `<h1>Pago Rechazado</h1><p>Tu pago con boleta <strong>${boletaNumber}</strong> fue rechazado.${reason ? ' Razón: '+reason : ''}</p>`;
    this.enqueue({ to, subject: 'Pago rechazado', html });
  }
}
