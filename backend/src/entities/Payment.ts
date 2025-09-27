import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';
import { User } from './User';

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('payments')
@Index('UQ_payment_boleta_number', ['boletaNumber'], { unique: true })
export class Payment extends BaseEntityWithTimestamps {
  @Column({ type: 'varchar', length: 80, unique: true })
  boletaNumber!: string;

  @Column({ type: 'date' })
  boletaDate!: string; // ISO date string

  @Column({ type: 'varchar', length: 255 })
  boletaImage!: string; // Ruta al archivo

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejectionReason?: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  user!: User;
}
