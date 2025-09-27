import { Entity, Column, Index } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';

@Entity('audit_logs')
@Index('IDX_audit_entity_action', ['entity', 'action'])
@Index('IDX_audit_user', ['performedBy'])
export class AuditLog extends BaseEntityWithTimestamps {
  @Column({ type: 'varchar', length: 80 })
  entity!: string; // users | payments | workshops | enrollments | stats

  @Column({ type: 'varchar', length: 50 })
  action!: string; // export | view | update | delete | create

  @Column({ type: 'jsonb', nullable: true })
  details?: any;

  @Column({ type: 'uuid', nullable: true })
  performedBy?: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string | null;
}
