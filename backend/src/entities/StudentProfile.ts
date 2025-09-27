import { Entity, Column, OneToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';
import { User } from './User';

@Entity('student_profiles')
export class StudentProfile extends BaseEntityWithTimestamps {
  @Column({ type: 'varchar', length: 150 })
  nombreCompleto!: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  @Index('UQ_student_carnet', { unique: true })
  carnet!: string;

  @Column({ type: 'varchar', length: 120 })
  facultad!: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  telefono?: string | null;

  @OneToOne(() => User, (user) => user.studentProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
