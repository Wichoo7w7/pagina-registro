import { Entity, Column, Index, ManyToOne, Unique } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';
import { User } from './User';
import { Workshop } from './Workshop';

@Entity('enrollments')
@Unique('UQ_enrollment_qrcode', ['qrCode'])
@Index('IDX_enrollment_user_workshop', ['user', 'workshop'])
export class Enrollment extends BaseEntityWithTimestamps {
  @Column({ type: 'varchar', length: 120, unique: true })
  qrCode!: string;

  // Token cifrado usado para validar la asistencia (payload QR)
  @Column({ type: 'text', nullable: true })
  qrToken?: string | null;

  @Column({ type: 'boolean', default: false })
  attendance!: boolean;

  // Momento exacto de marcación de asistencia
  @Column({ type: 'timestamptz', nullable: true })
  attendanceAt?: Date | null;

  @Column({ type: 'timestamptz' })
  enrollmentDate!: Date;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Workshop, { eager: true, onDelete: 'CASCADE' })
  workshop!: Workshop;
}
