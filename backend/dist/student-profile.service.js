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
exports.StudentProfileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const User_1 = require("./entities/User");
const StudentProfile_1 = require("./entities/StudentProfile");
const Payment_1 = require("./entities/Payment");
let StudentProfileService = class StudentProfileService {
    constructor(userRepo, profileRepo, paymentRepo) {
        this.userRepo = userRepo;
        this.profileRepo = profileRepo;
        this.paymentRepo = paymentRepo;
    }
    async completeProfile(userId, dto) {
        const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
        // Guardar perfil
        const profile = this.profileRepo.create({
            nombreCompleto: dto.nombre,
            carnet: dto.carne,
            facultad: dto.ciclo,
            user,
        });
        await this.profileRepo.save(profile);
        // Guardar pago
        const payment = this.paymentRepo.create({
            boletaNumber: dto.boleta,
            boletaDate: new Date().toISOString().slice(0, 10),
            boletaImage: dto.imagen, // Aquí deberías guardar la ruta del archivo subido
            status: Payment_1.PaymentStatus.PENDING,
            user,
        });
        await this.paymentRepo.save(payment);
        // Aquí podrías guardar la autorización como campo extra si lo agregas a la entidad
        return { profile, payment };
    }
};
exports.StudentProfileService = StudentProfileService;
exports.StudentProfileService = StudentProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(User_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(StudentProfile_1.StudentProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(Payment_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentProfileService);
