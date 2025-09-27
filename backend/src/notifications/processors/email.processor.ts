import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLog, EmailStatus } from '../../entities/EmailLog';
import { TemplateService } from '../services/template.service';
import { EmailJobType } from '../services/email.service';

interface EmailJobData { to: string; subject: string; type: EmailJobType; data: Record<string, any>; }

@Processor('emails')
export class EmailProcessor {
  private transporter: nodemailer.Transporter;
  constructor(
    private config: ConfigService,
    private templates: TemplateService,
    @InjectRepository(EmailLog) private emailLogRepo: Repository<EmailLog>
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: parseInt(this.config.get<string>('SMTP_PORT','587'),10),
      secure: this.config.get<string>('SMTP_SECURE','false') === 'true',
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASSWORD')
      }
    });
  }

  @Process('*')
  async handle(job: Job<EmailJobData>) {
    const { to, subject, type, data } = job.data;
    const log = this.emailLogRepo.create({ to, subject, type, status: EmailStatus.PENDING, attempts: job.attemptsMade, meta: data });
    await this.emailLogRepo.save(log);
    try {
      const html = this.renderTemplate(type, data);
      if (this.config.get<string>('EMAIL_DEV_PREVIEW','false') === 'true') {
        // En modo preview sólo guardamos HTML en meta
        log.status = EmailStatus.SENT;
        log.meta = { ...log.meta, preview: true, html };
        await this.emailLogRepo.save(log);
        return;
      }
      await this.transporter.sendMail({ from: this.config.get<string>('EMAIL_FROM'), to, subject, html });
      log.status = EmailStatus.SENT;
      log.attempts = job.attemptsMade;
      await this.emailLogRepo.save(log);
    } catch (err: any) {
      log.status = EmailStatus.FAILED;
      log.lastError = err?.message || 'Error desconocido';
      log.attempts = job.attemptsMade;
      await this.emailLogRepo.save(log);
      throw err; // permite reintentos de Bull
    }
  }

  private renderTemplate(type: EmailJobType, data: Record<string, any>): string {
    switch (type) {
      case EmailJobType.VERIFICATION:
        return this.templates.render({ template: 'verification', variables: data });
      case EmailJobType.RESET:
        return this.templates.render({ template: 'reset', variables: data });
      case EmailJobType.PAYMENT_APPROVED:
        return this.templates.render({ template: 'payment-approved', variables: data });
      case EmailJobType.PAYMENT_REJECTED:
        return this.templates.render({ template: 'payment-rejected', variables: data });
      case EmailJobType.ENROLLMENT:
        return this.templates.render({ template: 'enrollment', variables: data });
      default:
        return this.templates.render({ template: 'generic', variables: data });
    }
  }
}
