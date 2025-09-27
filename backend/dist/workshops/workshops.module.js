"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkshopsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const Workshop_1 = require("../entities/Workshop");
const Enrollment_1 = require("../entities/Enrollment");
const User_1 = require("../entities/User");
const workshop_service_1 = require("./workshop.service");
const enrollment_service_1 = require("./enrollment.service");
const workshop_controller_1 = require("./workshop.controller");
const qr_service_1 = require("./qr/qr.service");
const notifications_module_1 = require("../notifications/notifications.module");
let WorkshopsModule = class WorkshopsModule {
};
exports.WorkshopsModule = WorkshopsModule;
exports.WorkshopsModule = WorkshopsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([Workshop_1.Workshop, Enrollment_1.Enrollment, User_1.User]),
            notifications_module_1.NotificationsModule
        ],
        controllers: [workshop_controller_1.WorkshopController],
        providers: [workshop_service_1.WorkshopService, enrollment_service_1.EnrollmentService, qr_service_1.QrService],
        exports: [workshop_service_1.WorkshopService, enrollment_service_1.EnrollmentService],
    })
], WorkshopsModule);
