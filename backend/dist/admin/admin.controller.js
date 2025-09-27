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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const stats_service_1 = require("./stats.service");
const export_service_1 = require("./export.service");
const audit_log_service_1 = require("./audit-log.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const throttler_1 = require("@nestjs/throttler");
let AdminController = class AdminController {
    constructor(statsService, exportService, audit) {
        this.statsService = statsService;
        this.exportService = exportService;
        this.audit = audit;
    }
    async general() {
        const data = await this.statsService.getGeneralStats();
        await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'general' } });
        return data;
    }
    async payments() {
        const data = await this.statsService.getPaymentStats();
        await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'payments' } });
        return data;
    }
    async workshops() {
        const data = await this.statsService.getWorkshopStats();
        await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'workshops' } });
        return data;
    }
    async users() {
        const data = await this.statsService.getUserStats();
        await this.audit.log({ entity: 'stats', action: 'view', details: { type: 'users' } });
        return data;
    }
    async export(entity, res, format, from, to, status) {
        const filters = {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            status,
        };
        const fmt = (format === 'xlsx') ? 'xlsx' : 'csv';
        const result = await this.exportService.export(entity, fmt, filters);
        await this.audit.log({ entity, action: 'export', details: { format: fmt, ...filters } });
        res.setHeader('Content-Type', result.mime);
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        return res.send(result.buffer);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats/general'),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60 } }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "general", null);
__decorate([
    (0, common_1.Get)('stats/payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "payments", null);
__decorate([
    (0, common_1.Get)('stats/workshops'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "workshops", null);
__decorate([
    (0, common_1.Get)('stats/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "users", null);
__decorate([
    (0, common_1.Get)('export/:entity'),
    __param(0, (0, common_1.Param)('entity')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('format')),
    __param(3, (0, common_1.Query)('from')),
    __param(4, (0, common_1.Query)('to')),
    __param(5, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "export", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, throttler_1.ThrottlerGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [stats_service_1.StatsService,
        export_service_1.ExportService,
        audit_log_service_1.AuditLogService])
], AdminController);
