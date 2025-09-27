import { Entity, Column, Index } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

@Entity('email_logs')
@Index('IDX_email_logs_type_status', ['type','status'])
@Index('IDX_email_logs_createdAt', ['createdAt'])
export class EmailLog extends BaseEntityWithTimestamps {
  @Column({ type: 'varchar', length: 180 })
  to!: string;

  @Column({ type: 'varchar', length: 150 })
  subject!: string;

  @Column({ type: 'varchar', length: 60 })
  type!: string; // verification | reset | paymentApproved | paymentRejected | enrollment

  @Column({ type: 'enum', enum: EmailStatus, default: EmailStatus.PENDING })
  status!: EmailStatus;

  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta?: any;
}
