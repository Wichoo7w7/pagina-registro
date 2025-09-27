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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const BaseEntityWithTimestamps_1 = require("./BaseEntityWithTimestamps");
const StudentProfile_1 = require("./StudentProfile");
const Role_1 = require("./Role");
const class_validator_1 = require("class-validator");
let User = class User extends BaseEntityWithTimestamps_1.BaseEntityWithTimestamps {
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 180, unique: true }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9._%+-]+@umg\.edu\.gt$/, { message: 'Email debe ser dominio umg.edu.gt' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "verificationToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "resetToken", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => StudentProfile_1.StudentProfile, (profile) => profile.user, { cascade: true, nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'student_profile_id' }),
    __metadata("design:type", Object)
], User.prototype, "studentProfile", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Role_1.Role, (role) => role.users, { cascade: ['insert'] }),
    (0, typeorm_1.JoinTable)({ name: 'user_roles', joinColumn: { name: 'user_id' }, inverseJoinColumn: { name: 'role_id' } }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users'),
    (0, typeorm_1.Index)('UQ_user_email', ['email'], { unique: true })
], User);
