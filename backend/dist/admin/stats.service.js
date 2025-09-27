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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const User_1 = require("../entities/User");
const Workshop_1 = require("../entities/Workshop");
const Payment_1 = require("../entities/Payment");
const Enrollment_1 = require("../entities/Enrollment");
const StudentProfile_1 = require("../entities/StudentProfile");
let StatsService = class StatsService {
    constructor(userRepo, workshopRepo, paymentRepo, enrollmentRepo, profileRepo) {
        this.userRepo = userRepo;
        this.workshopRepo = workshopRepo;
        this.paymentRepo = paymentRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.profileRepo = profileRepo;
    }
    async getGeneralStats() {
        const [users, workshops, payments, enrollments] = await Promise.all([
            this.userRepo.count(),
            this.workshopRepo.count(),
            this.paymentRepo.count(),
            this.enrollmentRepo.count(),
        ]);
        return { users, workshops, payments, enrollments };
    }
    async getPaymentStats(days = 30) {
        const since = new Date(Date.now() - days * 86400000);
        const all = await this.paymentRepo.find({ where: { createdAt: since }, order: { createdAt: 'ASC' } });
        // Mejor usar QueryBuilder para agrupar; aquí un enfoque simple para ilustrar
        const distribution = { pending: 0, approved: 0, rejected: 0 };
        const timeSeries = [];
        const bucket = {};
        const list = await this.paymentRepo.find();
        list.forEach((p) => {
            distribution[p.status] = (distribution[p.status] || 0) + 1;
            const d = new Date(p.createdAt).toISOString().slice(0, 10);
            bucket[d] = bucket[d] || { count: 0, approved: 0, rejected: 0 };
            bucket[d].count++;
            if (p.status === Payment_1.PaymentStatus.APPROVED)
                bucket[d].approved++;
            if (p.status === Payment_1.PaymentStatus.REJECTED)
                bucket[d].rejected++;
        });
        Object.entries(bucket).sort().forEach(([date, v]) => timeSeries.push({ date, ...v }));
        return { distribution, timeSeries };
    }
    async getWorkshopStats() {
        const workshops = await this.workshopRepo.find();
        const enrollments = await this.enrollmentRepo.find();
        const perWorkshop = workshops.map((w) => {
            const count = enrollments.filter((e) => e.workshop.id === w.id).length;
            const used = w.cupoMaximo - w.cuposDisponibles;
            return {
                id: w.id,
                nombre: w.nombre,
                inscritos: count,
                cuposUsados: used,
                cupoMaximo: w.cupoMaximo,
                ocupacion: Number((used / w.cupoMaximo).toFixed(2)),
            };
        });
        return { perWorkshop };
    }
    async getUserStats() {
        const users = await this.userRepo.find();
        const profiles = await this.profileRepo.find();
        const byDate = {};
        users.forEach((u) => {
            const d = new Date(u.createdAt).toISOString().slice(0, 10);
            byDate[d] = (byDate[d] || 0) + 1;
        });
        const facultyCount = {};
        profiles.forEach((p) => {
            facultyCount[p.facultad] = (facultyCount[p.facultad] || 0) + 1;
        });
        const dateSeries = Object.entries(byDate).sort().map(([date, count]) => ({ date, count }));
        const faculties = Object.entries(facultyCount).sort((a, b) => b[1] - a[1]).map(([facultad, count]) => ({ facultad, count }));
        return { dateSeries, faculties };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(User_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(Workshop_1.Workshop)),
    __param(2, (0, typeorm_1.InjectRepository)(Payment_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(Enrollment_1.Enrollment)),
    __param(4, (0, typeorm_1.InjectRepository)(StudentProfile_1.StudentProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatsService);
