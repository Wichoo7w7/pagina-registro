import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';
import { User } from './User';

export enum RoleName {
  ADMIN = 'admin',
  STUDENT = 'student'
}

@Entity('roles')
@Index('UQ_role_name', ['name'], { unique: true })
export class Role extends BaseEntityWithTimestamps {
  @Column({ type: 'enum', enum: RoleName })
  name!: RoleName;

  @Column({ type: 'varchar', length: 150 })
  description!: string;

  @OneToMany(() => User, (user) => user.roles)
  users!: User[];
}
