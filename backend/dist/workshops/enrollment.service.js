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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Enrollment_1 = require("../entities/Enrollment");
const Workshop_1 = require("../entities/Workshop");
const User_1 = require("../entities/User");
const qr_service_1 = require("./qr/qr.service");
const uuid_1 = require("uuid");
const email_service_1 = require("../notifications/services/email.service");
let EnrollmentService = class EnrollmentService {
    constructor(enrollmentRepo, workshopRepo, userRepo, qrService, emailService) {
        this.enrollmentRepo = enrollmentRepo;
        this.workshopRepo = workshopRepo;
        this.userRepo = userRepo;
        this.qrService = qrService;
        this.emailService = emailService;
    }
    async createEnrollment(userId, workshopId) {
        const workshop = await this.workshopRepo.findOne({ where: { id: workshopId, activo: true } });
        if (!workshop)
            throw new common_1.NotFoundException('Taller no encontrado o inactivo');
        if (workshop.cuposDisponibles <= 0) {
            throw new common_1.BadRequestException('No hay cupos disponibles');
        }
        // Validar que el usuario no esté ya inscrito
        const existing = await this.enrollmentRepo.findOne({ where: { user: { id: userId }, workshop: { id: workshopId } } });
        if (existing)
            throw new common_1.BadRequestException('Ya inscrito en el taller');
        // TODO: Validar pago aprobado (se necesitaría enlazar Payment con Workshop si aplica)
        const enrollment = new Enrollment_1.Enrollment();
        enrollment.enrollmentDate = new Date();
        enrollment.user = { id: userId };
        enrollment.workshop = { id: workshopId };
        // Generar base qr code
        enrollment.qrCode = (0, uuid_1.v4)();
        const payload = { eid: enrollment.qrCode, uid: userId, ws: workshopId, ts: Date.now() };
        const token = await this.qrService.generateEncryptedPayload(payload);
        enrollment.qrToken = token;
        const saved = await this.enrollmentRepo.save(enrollment);
        // Actualizar cupos
        workshop.cuposDisponibles -= 1;
        await this.workshopRepo.save(workshop);
        // Enviar correo de confirmación (best-effort, no bloquear la respuesta)
        try {
            // Obtener datos mínimos del usuario y del workshop para personalizar
            const user = await this.userRepo.findOne({ where: { id: userId } });
            if (user) {
                const displayName = user.email.split('@')[0];
                this.emailService.sendEnrollmentConfirmationEmail(user.email, workshop.nombre || 'Taller', workshop.fechaInicio ? workshop.fechaInicio.toLocaleDateString('es-GT') : undefined, displayName);
            }
        }
        catch (e) {
            // Log silencioso; en un futuro se podría usar un logger central
            // console.error('Error enviando email de inscripción', e);
        }
        return saved;
    }
    async findUserEnrollments(userId) {
        return this.enrollmentRepo.find({ where: { user: { id: userId } }, order: { enrollmentDate: 'DESC' } });
    }
    async validateQR(token) {
        const payload = await this.qrService.decodeEncryptedPayload(token);
        const qrCode = payload.eid;
        const enrollment = await this.enrollmentRepo.findOne({ where: { qrCode } });
        if (!enrollment)
            throw new common_1.NotFoundException('Inscripción no encontrada');
        return enrollment;
    }
    async updateAttendance(token) {
        const enrollment = await this.validateQR(token);
        if (enrollment.attendance) {
            throw new common_1.BadRequestException('Asistencia ya registrada');
        }
        enrollment.attendance = true;
        enrollment.attendanceAt = new Date();
        return this.enrollmentRepo.save(enrollment);
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Enrollment_1.Enrollment)),
    __param(1, (0, typeorm_1.InjectRepository)(Workshop_1.Workshop)),
    __param(2, (0, typeorm_1.InjectRepository)(User_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        qr_service_1.QrService,
        email_service_1.EmailService])
], EnrollmentService);
