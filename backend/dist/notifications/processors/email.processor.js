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
exports.EmailProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const EmailLog_1 = require("../../entities/EmailLog");
const template_service_1 = require("../services/template.service");
const email_service_1 = require("../services/email.service");
let EmailProcessor = class EmailProcessor {
    constructor(config, templates, emailLogRepo) {
        this.config = config;
        this.templates = templates;
        this.emailLogRepo = emailLogRepo;
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
    async handle(job) {
        const { to, subject, type, data } = job.data;
        const log = this.emailLogRepo.create({ to, subject, type, status: EmailLog_1.EmailStatus.PENDING, attempts: job.attemptsMade, meta: data });
        await this.emailLogRepo.save(log);
        try {
            const html = this.renderTemplate(type, data);
            if (this.config.get('EMAIL_DEV_PREVIEW', 'false') === 'true') {
                // En modo preview sólo guardamos HTML en meta
                log.status = EmailLog_1.EmailStatus.SENT;
                log.meta = { ...log.meta, preview: true, html };
                await this.emailLogRepo.save(log);
                return;
            }
            await this.transporter.sendMail({ from: this.config.get('EMAIL_FROM'), to, subject, html });
            log.status = EmailLog_1.EmailStatus.SENT;
            log.attempts = job.attemptsMade;
            await this.emailLogRepo.save(log);
        }
        catch (err) {
            log.status = EmailLog_1.EmailStatus.FAILED;
            log.lastError = err?.message || 'Error desconocido';
            log.attempts = job.attemptsMade;
            await this.emailLogRepo.save(log);
            throw err; // permite reintentos de Bull
        }
    }
    renderTemplate(type, data) {
        switch (type) {
            case email_service_1.EmailJobType.VERIFICATION:
                return this.templates.render({ template: 'verification', variables: data });
            case email_service_1.EmailJobType.RESET:
                return this.templates.render({ template: 'reset', variables: data });
            case email_service_1.EmailJobType.PAYMENT_APPROVED:
                return this.templates.render({ template: 'payment-approved', variables: data });
            case email_service_1.EmailJobType.PAYMENT_REJECTED:
                return this.templates.render({ template: 'payment-rejected', variables: data });
            case email_service_1.EmailJobType.ENROLLMENT:
                return this.templates.render({ template: 'enrollment', variables: data });
            default:
                return this.templates.render({ template: 'generic', variables: data });
        }
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bull_1.Process)('*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handle", null);
exports.EmailProcessor = EmailProcessor = __decorate([
    (0, bull_1.Processor)('emails'),
    __param(2, (0, typeorm_1.InjectRepository)(EmailLog_1.EmailLog)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        template_service_1.TemplateService,
        typeorm_2.Repository])
], EmailProcessor);
