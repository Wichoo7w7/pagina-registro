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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentProfile = void 0;
const typeorm_1 = require("typeorm");
const BaseEntityWithTimestamps_1 = require("./BaseEntityWithTimestamps");
const User_1 = require("./User");
let StudentProfile = class StudentProfile extends BaseEntityWithTimestamps_1.BaseEntityWithTimestamps {
};
exports.StudentProfile = StudentProfile;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], StudentProfile.prototype, "nombreCompleto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, unique: true }),
    (0, typeorm_1.Index)('UQ_student_carnet', { unique: true }),
    __metadata("design:type", String)
], StudentProfile.prototype, "carnet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], StudentProfile.prototype, "facultad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 25, nullable: true }),
    __metadata("design:type", Object)
], StudentProfile.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_1.User, (user) => user.studentProfile, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], StudentProfile.prototype, "user", void 0);
exports.StudentProfile = StudentProfile = __decorate([
    (0, typeorm_1.Entity)('student_profiles')
], StudentProfile);
