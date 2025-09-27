"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Payment_1 = require("../entities/Payment");
const User_1 = require("../entities/User");
const payment_events_constants_1 = require("./events/payment-events.constants");
const event_emitter_1 = require("@nestjs/event-emitter");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const uuid_1 = require("uuid");
let PaymentsService = class PaymentsService {
    constructor(paymentRepo, userRepo, events) {
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
        this.events = events;
        this.uploadDir = path.resolve('uploads', 'payments');
        if (!fs.existsSync(this.uploadDir))
            fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    buildQuery(filters) {
        let qb = this.paymentRepo.createQueryBuilder('p').leftJoinAndSelect('p.user', 'user');
        if (filters.status)
            qb = qb.andWhere('p.status = :status', { status: filters.status });
        if (filters.userId)
            qb = qb.andWhere('user.id = :userId', { userId: filters.userId });
        if (filters.dateFrom)
            qb = qb.andWhere('p.boletaDate >= :dateFrom', { dateFrom: filters.dateFrom });
        if (filters.dateTo)
            qb = qb.andWhere('p.boletaDate <= :dateTo', { dateTo: filters.dateTo });
        qb = qb.orderBy('p.createdAt', 'DESC');
        return qb;
    }
    async createPayment(userId, dto, file) {
        if (!file)
            throw new common_1.BadRequestException('Archivo requerido');
        // Validación básica de tipo
        const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!allowed.includes(file.mimetype))
            throw new common_1.BadRequestException('Tipo de archivo no permitido');
        if (file.size > 5 * 1024 * 1024)
            throw new common_1.BadRequestException('Archivo excede 5MB');
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        // Nombre seguro
        const ext = path.extname(file.originalname) || (file.mimetype === 'application/pdf' ? '.pdf' : '.bin');
        const safeName = `${(0, uuid_1.v4)()}${ext}`;
        const destPath = path.join(this.uploadDir, safeName);
        fs.writeFileSync(destPath, file.buffer);
        const existing = await this.paymentRepo.findOne({ where: { boletaNumber: dto.boletaNumber } });
        if (existing)
            throw new common_1.BadRequestException('Boleta ya registrada');
        const payment = this.paymentRepo.create({
            boletaNumber: dto.boletaNumber,
            boletaDate: dto.boletaDate,
            boletaImage: destPath,
            status: Payment_1.PaymentStatus.PENDING,
            user
        });
        return this.paymentRepo.save(payment);
    }
    async findAll(filters) {
        return this.buildQuery(filters).getMany();
    }
    async findUserPayments(userId) {
        return this.paymentRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
    }
    async approvePayment(paymentId, adminId) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: ['user'] });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        if (payment.status === Payment_1.PaymentStatus.APPROVED)
            return payment;
        payment.status = Payment_1.PaymentStatus.APPROVED;
        payment.rejectionReason = null;
        const saved = await this.paymentRepo.save(payment);
        this.events.emit(payment_events_constants_1.PAYMENT_EVENTS.APPROVED, { userEmail: payment.user.email, boletaNumber: payment.boletaNumber });
        return saved;
    }
    async rejectPayment(paymentId, dto, adminId) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId }, relations: ['user'] });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        if (dto.status !== Payment_1.PaymentStatus.REJECTED)
            throw new common_1.BadRequestException('Status debe ser rejected');
        payment.status = Payment_1.PaymentStatus.REJECTED;
        payment.rejectionReason = dto.rejectionReason || null;
        const saved = await this.paymentRepo.save(payment);
        this.events.emit(payment_events_constants_1.PAYMENT_EVENTS.REJECTED, { userEmail: payment.user.email, boletaNumber: payment.boletaNumber, reason: payment.rejectionReason });
        return saved;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Payment_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(User_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], PaymentsService);
