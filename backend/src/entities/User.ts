import { Entity, Column, Index, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';
import { StudentProfile } from './StudentProfile';
import { Role } from './Role';
import { IsEmail, Matches } from 'class-validator';

@Entity('users')
@Index('UQ_user_email', ['email'], { unique: true })
export class User extends BaseEntityWithTimestamps {
  @Column({ type: 'varchar', length: 180, unique: true })
  @IsEmail()
  @Matches(/^[A-Za-z0-9._%+-]+@umg\.edu\.gt$/,{ message: 'Email debe ser dominio umg.edu.gt' })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string; // Hash bcrypt

  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetToken?: string | null;

  @OneToOne(() => StudentProfile, (profile) => profile.user, { cascade: true, nullable: true })
  @JoinColumn({ name: 'student_profile_id' })
  studentProfile?: StudentProfile | null;

  @ManyToMany(() => Role, (role) => role.users, { cascade: ['insert'] })
  @JoinTable({ name: 'user_roles', joinColumn: { name: 'user_id' }, inverseJoinColumn: { name: 'role_id' } })
  roles!: Role[];
}
