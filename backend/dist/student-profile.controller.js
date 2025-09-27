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
exports.StudentProfileController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const complete_profile_dto_1 = require("./dto/complete-profile.dto");
const student_profile_service_1 = require("./student-profile.service");
let StudentProfileController = class StudentProfileController {
    constructor(service) {
        this.service = service;
    }
    async complete(req, dto) {
        return this.service.completeProfile(req.user.sub, dto);
    }
};
exports.StudentProfileController = StudentProfileController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('complete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, complete_profile_dto_1.CompleteProfileDto]),
    __metadata("design:returntype", Promise)
], StudentProfileController.prototype, "complete", null);
exports.StudentProfileController = StudentProfileController = __decorate([
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [student_profile_service_1.StudentProfileService])
], StudentProfileController);
