import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Workshop } from '../entities/Workshop';
import { Enrollment } from '../entities/Enrollment';
import { User } from '../entities/User';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

interface WorkshopFilters {
  activo?: boolean;
  desde?: Date;
  hasta?: Date;
  disponible?: boolean; // cuposDisponibles > 0
}

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Workshop) private readonly workshopRepo: Repository<Workshop>,
    @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async create(dto: CreateWorkshopDto): Promise<Workshop> {
    if (new Date(dto.fechaFin) < new Date(dto.fechaInicio)) {
      throw new BadRequestException('fechaFin debe ser posterior a fechaInicio');
    }
    const entity = this.workshopRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      instructor: dto.instructor,
      cupoMaximo: dto.cupoMaximo,
      cuposDisponibles: dto.cupoMaximo,
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: new Date(dto.fechaFin),
      horario: dto.horario,
      lugar: dto.lugar,
      activo: dto.activo,
    });
    return this.workshopRepo.save(entity);
  }

  async findAll(filters: WorkshopFilters): Promise<Workshop[]> {
    const where: FindOptionsWhere<Workshop> = {};
    if (filters.activo !== undefined) where.activo = filters.activo;
    if (filters.desde && filters.hasta) {
      where.fechaInicio = Between(filters.desde, filters.hasta);
    } else if (filters.desde) {
      where.fechaInicio = MoreThanOrEqual(filters.desde);
    } else if (filters.hasta) {
      where.fechaInicio = LessThanOrEqual(filters.hasta);
    }
    // Filtro disponibilidad se hará post-query para no complicar el where
    const list = await this.workshopRepo.find({ where, order: { fechaInicio: 'ASC' } });
  return filters.disponible ? list.filter((w: Workshop) => w.cuposDisponibles > 0) : list;
  }

  async findOne(id: string, userId?: string): Promise<{ workshop: Workshop; inscrito: boolean }> {
    const workshop = await this.workshopRepo.findOne({ where: { id } });
    if (!workshop) throw new NotFoundException('Taller no encontrado');
    let inscrito = false;
    if (userId) {
      const enrollment = await this.enrollmentRepo.findOne({ where: { user: { id: userId }, workshop: { id } } });
      inscrito = !!enrollment;
    }
    return { workshop, inscrito };
  }

  async update(id: string, dto: UpdateWorkshopDto): Promise<Workshop> {
    const workshop = await this.workshopRepo.findOne({ where: { id } });
    if (!workshop) throw new NotFoundException('Taller no encontrado');

    if (dto.fechaInicio && dto.fechaFin && new Date(dto.fechaFin) < new Date(dto.fechaInicio)) {
      throw new BadRequestException('fechaFin debe ser posterior a fechaInicio');
    }

    if (dto.cupoMaximo && dto.cupoMaximo < workshop.cupoMaximo) {
      // Si se reduce el cupo máximo por debajo del número ya inscrito -> error
      const inscritos = workshop.cupoMaximo - workshop.cuposDisponibles;
      if (dto.cupoMaximo < inscritos) {
        throw new BadRequestException('Nuevo cupo máximo inferior a inscritos actuales');
      }
      // Ajustar cuposDisponibles relativo al nuevo cupoMaximo
      const usados = inscritos; // mismos inscritos
      workshop.cupoMaximo = dto.cupoMaximo;
      workshop.cuposDisponibles = workshop.cupoMaximo - usados;
    }

    Object.assign(workshop, {
      nombre: (dto as any).nombre ?? workshop.nombre,
      descripcion: (dto as any).descripcion ?? workshop.descripcion,
      instructor: (dto as any).instructor ?? workshop.instructor,
      fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : workshop.fechaInicio,
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : workshop.fechaFin,
      horario: (dto as any).horario ?? workshop.horario,
      lugar: (dto as any).lugar ?? workshop.lugar,
      activo: dto.activo ?? workshop.activo,
    });

    return this.workshopRepo.save(workshop);
  }

  async remove(id: string): Promise<void> {
    const workshop = await this.workshopRepo.findOne({ where: { id } });
    if (!workshop) throw new NotFoundException('Taller no encontrado');
    await this.workshopRepo.softRemove(workshop);
  }

  async enrollStudent(user: User, workshopId: string): Promise<Enrollment> {
    const workshop = await this.workshopRepo.findOne({ where: { id: workshopId, activo: true } });
    if (!workshop) throw new NotFoundException('Taller no encontrado o inactivo');
    if (workshop.cuposDisponibles <= 0) throw new BadRequestException('No hay cupos disponibles');

    const already = await this.enrollmentRepo.findOne({ where: { user: { id: user.id }, workshop: { id: workshopId } } });
    if (already) throw new BadRequestException('Ya inscrito');

    // Validación de pago aprobado: (Placeholder) aquí se podría comprobar existencia de Payment aprobado vinculado

    // Crear inscripción mínima (EnrollmentService contiene lógica avanzada de QR si se requiere unificada)
    const enrollment = this.enrollmentRepo.create({
      qrCode: `E-${Date.now()}-${Math.round(Math.random()*1e6)}`,
      enrollmentDate: new Date(),
      user: { id: user.id } as User,
      workshop: { id: workshopId } as Workshop,
      attendance: false,
    });
    const saved = await this.enrollmentRepo.save(enrollment);

    workshop.cuposDisponibles -= 1;
    await this.workshopRepo.save(workshop);
    return saved;
  }

  async getWorkshopStats(): Promise<{ total: number; activos: number; completados: number; proximos: number; ocupacionPromedio: number; }> {
    const all = await this.workshopRepo.find();
    const now = new Date();
    const total = all.length;
    const activos = all.filter((w: Workshop) => w.activo).length;
    const completados = all.filter((w: Workshop) => w.fechaFin < now).length;
    const proximos = all.filter((w: Workshop) => w.fechaInicio > now).length;
    const usadosTotal = all.reduce((acc: number, w: Workshop) => acc + (w.cupoMaximo - w.cuposDisponibles), 0);
    const capacidadTotal = all.reduce((acc: number, w: Workshop) => acc + w.cupoMaximo, 0);
    const ocupacionPromedio = capacidadTotal ? Number((usadosTotal / capacidadTotal).toFixed(2)) : 0;
    return { total, activos, completados, proximos, ocupacionPromedio };
  }
}
