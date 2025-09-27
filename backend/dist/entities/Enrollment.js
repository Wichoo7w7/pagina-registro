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
exports.Enrollment = void 0;
const typeorm_1 = require("typeorm");
const BaseEntityWithTimestamps_1 = require("./BaseEntityWithTimestamps");
const User_1 = require("./User");
const Workshop_1 = require("./Workshop");
let Enrollment = class Enrollment extends BaseEntityWithTimestamps_1.BaseEntityWithTimestamps {
};
exports.Enrollment = Enrollment;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, unique: true }),
    __metadata("design:type", String)
], Enrollment.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Enrollment.prototype, "qrToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Enrollment.prototype, "attendance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], Enrollment.prototype, "attendanceAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Enrollment.prototype, "enrollmentDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", User_1.User)
], Enrollment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Workshop_1.Workshop, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", Workshop_1.Workshop)
], Enrollment.prototype, "workshop", void 0);
exports.Enrollment = Enrollment = __decorate([
    (0, typeorm_1.Entity)('enrollments'),
    (0, typeorm_1.Unique)('UQ_enrollment_qrcode', ['qrCode']),
    (0, typeorm_1.Index)('IDX_enrollment_user_workshop', ['user', 'workshop'])
], Enrollment);
