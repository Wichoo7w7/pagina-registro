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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("@nestjs/config");
let EmailService = EmailService_1 = class EmailService {
    constructor(config) {
        this.config = config;
        this.queue = [];
        this.processing = false;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.transporter = nodemailer_1.default.createTransport({
            host: this.config.get('SMTP_HOST'),
            port: parseInt(this.config.get('SMTP_PORT', '587'), 10),
            secure: this.config.get('SMTP_SECURE', 'false') === 'true',
            auth: {
                user: this.config.get('SMTP_USER'),
                pass: this.config.get('SMTP_PASSWORD')
            }
        });
    }
    enqueue(job) {
        this.queue.push(job);
        this.process().catch(e => this.logger.error(e));
    }
    async process() {
        if (this.processing)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            const job = this.queue.shift();
            try {
                await this.transporter.sendMail({
                    from: this.config.get('EMAIL_FROM'),
                    to: job.to,
                    subject: job.subject,
                    html: job.html
                });
                this.logger.log(`Email enviado a ${job.to}`);
            }
            catch (err) {
                this.logger.error('Fallo envío email', err);
            }
        }
        this.processing = false;
    }
    sendVerificationEmail(to, token) {
        const link = `${this.config.get('APP_BASE_URL', 'http://localhost:3000')}/auth/verify-email?token=${token}`;
        const html = `<h1>Verifica tu correo</h1><p>Haz clic <a href="${link}">aquí</a> para verificar tu cuenta. Este enlace expira pronto.</p>`;
        this.enqueue({ to, subject: 'Verificación de cuenta', html });
    }
    sendResetPasswordEmail(to, token) {
        const link = `${this.config.get('APP_BASE_URL', 'http://localhost:3000')}/auth/reset-password?token=${token}`;
        const html = `<h1>Restablecer contraseña</h1><p>Haz clic <a href="${link}">aquí</a> para restablecer tu contraseña. Si no solicitaste esto ignora el mensaje.</p>`;
        this.enqueue({ to, subject: 'Restablecer contraseña', html });
    }
    sendPaymentApprovedEmail(to, boletaNumber) {
        const html = `<h1>Pago Aprobado</h1><p>Tu pago con boleta <strong>${boletaNumber}</strong> ha sido aprobado. Gracias.</p>`;
        this.enqueue({ to, subject: 'Pago aprobado', html });
    }
    sendPaymentRejectedEmail(to, boletaNumber, reason) {
        const html = `<h1>Pago Rechazado</h1><p>Tu pago con boleta <strong>${boletaNumber}</strong> fue rechazado.${reason ? ' Razón: ' + reason : ''}</p>`;
        this.enqueue({ to, subject: 'Pago rechazado', html });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
