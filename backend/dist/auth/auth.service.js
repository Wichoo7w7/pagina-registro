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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const User_1 = require("../entities/User");
const Role_1 = require("../entities/Role");
const StudentProfile_1 = require("../entities/StudentProfile");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const email_service_1 = require("../notifications/services/email.service");
const password_util_1 = require("./util/password.util");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(userRepo, roleRepo, profileRepo, jwt, config, email) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.profileRepo = profileRepo;
        this.jwt = jwt;
        this.config = config;
        this.email = email;
    }
    async register(dto) {
        if (dto.password !== dto.confirmPassword)
            throw new common_1.BadRequestException('Passwords no coinciden');
        if (!(0, password_util_1.isStrongPassword)(dto.password))
            throw new common_1.BadRequestException('Password débil');
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('Email ya registrado');
        const pepper = this.config.get('PASSWORD_PEPPER', '');
        const hashed = await bcryptjs_1.default.hash(dto.password + pepper, 10);
        const studentRole = await this.roleRepo.findOne({ where: { name: Role_1.RoleName.STUDENT } });
        if (!studentRole)
            throw new common_1.BadRequestException('Rol student no existe (ejecutar seed)');
        const verificationToken = (0, uuid_1.v4)();
        const user = this.userRepo.create({
            email: dto.email,
            password: hashed,
            isVerified: false,
            verificationToken,
            roles: [studentRole]
        });
        await this.userRepo.save(user);
        const profile = this.profileRepo.create({
            nombreCompleto: dto.nombreCompleto,
            carnet: dto.carnet,
            facultad: dto.facultad,
            user
        });
        await this.profileRepo.save(profile);
        this.email.sendVerificationEmail(user.email, verificationToken);
        return { message: 'Registro exitoso. Revisa tu correo para verificar.' };
    }
    async login(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email }, relations: ['roles'] });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const pepper = this.config.get('PASSWORD_PEPPER', '');
        const match = await bcryptjs_1.default.compare(dto.password + pepper, user.password);
        if (!match)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        if (!user.isVerified)
            throw new common_1.UnauthorizedException('Cuenta no verificada');
        return this.generateTokens(user);
    }
    generateTokens(user) {
        const payload = { sub: user.id, email: user.email, roles: user.roles?.map(r => r.name) || [] };
        const accessToken = this.jwt.sign(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                roles: user.roles?.map(r => r.name) || [],
                isVerified: user.isVerified
            }
        };
    }
    async verifyEmail(token) {
        const user = await this.userRepo.findOne({ where: { verificationToken: token } });
        if (!user)
            throw new common_1.BadRequestException('Token inválido');
        user.isVerified = true;
        user.verificationToken = null;
        await this.userRepo.save(user);
        return { message: 'Email verificado' };
    }
    async forgotPassword(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user)
            return { message: 'Si el email existe se enviará un enlace' }; // Evita enumeración
        user.resetToken = (0, uuid_1.v4)();
        await this.userRepo.save(user);
        this.email.sendResetPasswordEmail(user.email, user.resetToken);
        return { message: 'Revisa tu correo si existe la cuenta' };
    }
    async resetPassword(dto) {
        if (dto.newPassword !== dto.confirmPassword)
            throw new common_1.BadRequestException('Passwords no coinciden');
        if (!(0, password_util_1.isStrongPassword)(dto.newPassword))
            throw new common_1.BadRequestException('Password débil');
        const user = await this.userRepo.findOne({ where: { resetToken: dto.token } });
        if (!user)
            throw new common_1.BadRequestException('Token inválido');
        const pepper = this.config.get('PASSWORD_PEPPER', '');
        user.password = await bcryptjs_1.default.hash(dto.newPassword + pepper, 10);
        user.resetToken = null;
        await this.userRepo.save(user);
        return { message: 'Password actualizada' };
    }
    async validateUser(email, password) {
        const user = await this.userRepo.findOne({ where: { email }, relations: ['roles'] });
        if (!user)
            return null;
        const pepper = this.config.get('PASSWORD_PEPPER', '');
        const match = await bcryptjs_1.default.compare(password + pepper, user.password);
        if (!match)
            return null;
        return user;
    }
    async me(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['roles', 'studentProfile'] });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return { id: user.id, email: user.email, roles: user.roles.map(r => r.name), studentProfile: user.studentProfile };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(User_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(Role_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(StudentProfile_1.StudentProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
