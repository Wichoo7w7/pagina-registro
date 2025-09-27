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
exports.WorkshopController = void 0;
const common_1 = require("@nestjs/common");
const workshop_service_1 = require("./workshop.service");
const enrollment_service_1 = require("./enrollment.service");
const create_workshop_dto_1 = require("./dto/create-workshop.dto");
const update_workshop_dto_1 = require("./dto/update-workshop.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let WorkshopController = class WorkshopController {
    constructor(workshopService, enrollmentService) {
        this.workshopService = workshopService;
        this.enrollmentService = enrollmentService;
    }
    create(dto) {
        return this.workshopService.create(dto);
    }
    findAll(activo, desde, hasta, disponible) {
        return this.workshopService.findAll({
            activo: activo !== undefined ? activo === 'true' : undefined,
            desde: desde ? new Date(desde) : undefined,
            hasta: hasta ? new Date(hasta) : undefined,
            disponible: disponible !== undefined ? disponible === 'true' : undefined,
        });
    }
    findOne(id, req) {
        const userId = req.user?.id;
        return this.workshopService.findOne(id, userId);
    }
    update(id, dto) {
        return this.workshopService.update(id, dto);
    }
    remove(id) {
        return this.workshopService.remove(id);
    }
    enroll(id, req) {
        return this.workshopService.enrollStudent(req.user, id);
    }
    myEnrollments(req) {
        return this.enrollmentService.findUserEnrollments(req.user.id);
    }
};
exports.WorkshopController = WorkshopController;
__decorate([
    (0, common_1.Post)('workshops'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_workshop_dto_1.CreateWorkshopDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('workshops'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('activo')),
    __param(1, (0, common_1.Query)('desde')),
    __param(2, (0, common_1.Query)('hasta')),
    __param(3, (0, common_1.Query)('disponible')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('workshops/:id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('workshops/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_workshop_dto_1.UpdateWorkshopDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('workshops/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('workshops/:id/enroll'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "enroll", null);
__decorate([
    (0, common_1.Get)('enrollments/my-enrollments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "myEnrollments", null);
exports.WorkshopController = WorkshopController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [workshop_service_1.WorkshopService,
        enrollment_service_1.EnrollmentService])
], WorkshopController);
