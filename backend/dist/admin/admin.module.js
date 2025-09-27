"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const User_1 = require("../entities/User");
const Workshop_1 = require("../entities/Workshop");
const Payment_1 = require("../entities/Payment");
const Enrollment_1 = require("../entities/Enrollment");
const StudentProfile_1 = require("../entities/StudentProfile");
const AuditLog_1 = require("../entities/AuditLog");
const stats_service_1 = require("./stats.service");
const export_service_1 = require("./export.service");
const audit_log_service_1 = require("./audit-log.service");
const admin_controller_1 = require("./admin.controller");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([User_1.User, Workshop_1.Workshop, Payment_1.Payment, Enrollment_1.Enrollment, StudentProfile_1.StudentProfile, AuditLog_1.AuditLog])],
        controllers: [admin_controller_1.AdminController],
        providers: [stats_service_1.StatsService, export_service_1.ExportService, audit_log_service_1.AuditLogService],
        exports: [stats_service_1.StatsService]
    })
], AdminModule);
