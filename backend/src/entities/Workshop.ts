import { Entity, Column, Index } from 'typeorm';
import { BaseEntityWithTimestamps } from './BaseEntityWithTimestamps';

@Entity('workshops')
@Index('IDX_workshop_nombre', ['nombre'])
@Index('IDX_workshop_activo', ['activo'])
export class Workshop extends BaseEntityWithTimestamps {
  @Column({ type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'varchar', length: 120 })
  instructor!: string;

  @Column({ type: 'int' })
  cupoMaximo!: number;

  @Column({ type: 'int' })
  cuposDisponibles!: number;

  @Column({ type: 'timestamptz' })
  fechaInicio!: Date;

  @Column({ type: 'timestamptz' })
  fechaFin!: Date;

  @Column({ type: 'varchar', length: 120 })
  horario!: string;

  @Column({ type: 'varchar', length: 150 })
  lugar!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;
}
