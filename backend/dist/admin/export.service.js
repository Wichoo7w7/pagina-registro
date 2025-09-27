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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const User_1 = require("../entities/User");
const Payment_1 = require("../entities/Payment");
const Workshop_1 = require("../entities/Workshop");
const Enrollment_1 = require("../entities/Enrollment");
const sync_1 = require("csv-stringify/sync");
const exceljs_1 = __importDefault(require("exceljs"));
let ExportService = class ExportService {
    constructor(userRepo, paymentRepo, workshopRepo, enrollmentRepo) {
        this.userRepo = userRepo;
        this.paymentRepo = paymentRepo;
        this.workshopRepo = workshopRepo;
        this.enrollmentRepo = enrollmentRepo;
    }
    buildDateRange(filters, field) {
        if (filters.from && filters.to)
            return { [field]: (0, typeorm_2.Between)(filters.from, filters.to) };
        if (filters.from)
            return { [field]: (0, typeorm_2.MoreThanOrEqual)(filters.from) };
        if (filters.to)
            return { [field]: (0, typeorm_2.LessThanOrEqual)(filters.to) };
        return {};
    }
    async export(entity, format, filters) {
        switch (entity) {
            case 'users': return this.exportUsers(format, filters);
            case 'payments': return this.exportPayments(format, filters);
            case 'workshops': return this.exportWorkshops(format, filters);
            case 'enrollments': return this.exportEnrollments(format, filters);
            default: throw new common_1.BadRequestException('Entidad no soportada');
        }
    }
    async exportUsers(format, filters) {
        const where = this.buildDateRange(filters, 'createdAt');
        const rows = await this.userRepo.find({ where });
        const data = rows.map((u) => ({ id: u.id, email: u.email, isVerified: u.isVerified, createdAt: u.createdAt.toISOString() }));
        return this.formatData('users', data, format);
    }
    async exportPayments(format, filters) {
        const base = this.buildDateRange(filters, 'createdAt');
        const where = { ...base };
        if (filters.status)
            where.status = filters.status;
        const rows = await this.paymentRepo.find({ where });
        const data = rows.map((p) => ({ id: p.id, boletaNumber: p.boletaNumber, status: p.status, createdAt: p.createdAt.toISOString() }));
        return this.formatData('payments', data, format);
    }
    async exportWorkshops(format, filters) {
        const where = this.buildDateRange(filters, 'createdAt');
        const rows = await this.workshopRepo.find({ where });
        const data = rows.map((w) => ({ id: w.id, nombre: w.nombre, cupoMaximo: w.cupoMaximo, cuposDisponibles: w.cuposDisponibles, activo: w.activo }));
        return this.formatData('workshops', data, format);
    }
    async exportEnrollments(format, filters) {
        const where = this.buildDateRange(filters, 'createdAt');
        const rows = await this.enrollmentRepo.find({ where });
        const data = rows.map((e) => ({ id: e.id, workshop: e.workshop.nombre, user: e.user.email, attendance: e.attendance, enrollmentDate: e.enrollmentDate.toISOString() }));
        return this.formatData('enrollments', data, format);
    }
    async formatData(prefix, data, format) {
        if (format === 'csv') {
            const header = Object.keys(data[0] || {});
            const records = data.map(d => header.map(h => d[h]));
            const csv = (0, sync_1.stringify)([header, ...records], { delimiter: ',', bom: true });
            return { filename: `${prefix}.csv`, mime: 'text/csv', buffer: Buffer.from(csv, 'utf8') };
        }
        // XLSX
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('data');
        if (data.length) {
            sheet.columns = Object.keys(data[0]).map(k => ({ header: k, key: k }));
            data.forEach(row => sheet.addRow(row));
        }
        const buffer = await workbook.xlsx.writeBuffer();
        return { filename: `${prefix}.xlsx`, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(buffer) };
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(User_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(Payment_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(Workshop_1.Workshop)),
    __param(3, (0, typeorm_1.InjectRepository)(Enrollment_1.Enrollment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExportService);
