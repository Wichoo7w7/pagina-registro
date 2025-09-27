"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkshopService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Workshop_1 = require("../entities/Workshop");
const Enrollment_1 = require("../entities/Enrollment");
let WorkshopService = class WorkshopService {
    constructor(workshopRepo, enrollmentRepo) {
        this.workshopRepo = workshopRepo;
        this.enrollmentRepo = enrollmentRepo;
    }
    async create(dto) {
        if (new Date(dto.fechaFin) < new Date(dto.fechaInicio)) {
            throw new common_1.BadRequestException('fechaFin debe ser posterior a fechaInicio');
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
    async findAll(filters) {
        const where = {};
        if (filters.activo !== undefined)
            where.activo = filters.activo;
        if (filters.desde && filters.hasta) {
            where.fechaInicio = (0, typeorm_2.Between)(filters.desde, filters.hasta);
        }
        else if (filters.desde) {
            where.fechaInicio = (0, typeorm_2.MoreThanOrEqual)(filters.desde);
        }
        else if (filters.hasta) {
            where.fechaInicio = (0, typeorm_2.LessThanOrEqual)(filters.hasta);
        }
        // Filtro disponibilidad se hará post-query para no complicar el where
        const list = await this.workshopRepo.find({ where, order: { fechaInicio: 'ASC' } });
        return filters.disponible ? list.filter((w) => w.cuposDisponibles > 0) : list;
    }
    async findOne(id, userId) {
        const workshop = await this.workshopRepo.findOne({ where: { id } });
        if (!workshop)
            throw new common_1.NotFoundException('Taller no encontrado');
        let inscrito = false;
        if (userId) {
            const enrollment = await this.enrollmentRepo.findOne({ where: { user: { id: userId }, workshop: { id } } });
            inscrito = !!enrollment;
        }
        return { workshop, inscrito };
    }
    async update(id, dto) {
        const workshop = await this.workshopRepo.findOne({ where: { id } });
        if (!workshop)
            throw new common_1.NotFoundException('Taller no encontrado');
        if (dto.fechaInicio && dto.fechaFin && new Date(dto.fechaFin) < new Date(dto.fechaInicio)) {
            throw new common_1.BadRequestException('fechaFin debe ser posterior a fechaInicio');
        }
        if (dto.cupoMaximo && dto.cupoMaximo < workshop.cupoMaximo) {
            // Si se reduce el cupo máximo por debajo del número ya inscrito -> error
            const inscritos = workshop.cupoMaximo - workshop.cuposDisponibles;
            if (dto.cupoMaximo < inscritos) {
                throw new common_1.BadRequestException('Nuevo cupo máximo inferior a inscritos actuales');
            }
            // Ajustar cuposDisponibles relativo al nuevo cupoMaximo
            const usados = inscritos; // mismos inscritos
            workshop.cupoMaximo = dto.cupoMaximo;
            workshop.cuposDisponibles = workshop.cupoMaximo - usados;
        }
        Object.assign(workshop, {
            nombre: dto.nombre ?? workshop.nombre,
            descripcion: dto.descripcion ?? workshop.descripcion,
            instructor: dto.instructor ?? workshop.instructor,
            fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : workshop.fechaInicio,
            fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : workshop.fechaFin,
            horario: dto.horario ?? workshop.horario,
            lugar: dto.lugar ?? workshop.lugar,
            activo: dto.activo ?? workshop.activo,
        });
        return this.workshopRepo.save(workshop);
    }
    async remove(id) {
        const workshop = await this.workshopRepo.findOne({ where: { id } });
        if (!workshop)
            throw new common_1.NotFoundException('Taller no encontrado');
        await this.workshopRepo.softRemove(workshop);
    }
    async enrollStudent(user, workshopId) {
        const workshop = await this.workshopRepo.findOne({ where: { id: workshopId, activo: true } });
        if (!workshop)
            throw new common_1.NotFoundException('Taller no encontrado o inactivo');
        if (workshop.cuposDisponibles <= 0)
            throw new common_1.BadRequestException('No hay cupos disponibles');
        const already = await this.enrollmentRepo.findOne({ where: { user: { id: user.id }, workshop: { id: workshopId } } });
        if (already)
            throw new common_1.BadRequestException('Ya inscrito');
        // Validación de pago aprobado: (Placeholder) aquí se podría comprobar existencia de Payment aprobado vinculado
        // Crear inscripción mínima (EnrollmentService contiene lógica avanzada de QR si se requiere unificada)
        const enrollment = this.enrollmentRepo.create({
            qrCode: `E-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
            enrollmentDate: new Date(),
            user: { id: user.id },
            workshop: { id: workshopId },
            attendance: false,
        });
        const saved = await this.enrollmentRepo.save(enrollment);
        workshop.cuposDisponibles -= 1;
        await this.workshopRepo.save(workshop);
        return saved;
    }
    async getWorkshopStats() {
        const all = await this.workshopRepo.find();
        const now = new Date();
        const total = all.length;
        const activos = all.filter((w) => w.activo).length;
        const completados = all.filter((w) => w.fechaFin < now).length;
        const proximos = all.filter((w) => w.fechaInicio > now).length;
        const usadosTotal = all.reduce((acc, w) => acc + (w.cupoMaximo - w.cuposDisponibles), 0);
        const capacidadTotal = all.reduce((acc, w) => acc + w.cupoMaximo, 0);
        const ocupacionPromedio = capacidadTotal ? Number((usadosTotal / capacidadTotal).toFixed(2)) : 0;
        return { total, activos, completados, proximos, ocupacionPromedio };
    }
};
exports.WorkshopService = WorkshopService;
exports.WorkshopService = WorkshopService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Workshop_1.Workshop)),
    __param(1, (0, typeorm_1.InjectRepository)(Enrollment_1.Enrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WorkshopService);
