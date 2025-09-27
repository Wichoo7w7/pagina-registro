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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = exports.EmailJobType = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
var EmailJobType;
(function (EmailJobType) {
    EmailJobType["VERIFICATION"] = "verification";
    EmailJobType["RESET"] = "reset";
    EmailJobType["PAYMENT_APPROVED"] = "paymentApproved";
    EmailJobType["PAYMENT_REJECTED"] = "paymentRejected";
    EmailJobType["ENROLLMENT"] = "enrollment";
})(EmailJobType || (exports.EmailJobType = EmailJobType = {}));
let EmailService = EmailService_1 = class EmailService {
    constructor(queue) {
        this.queue = queue;
        this.logger = new common_1.Logger(EmailService_1.name);
    }
    enqueue(payload) {
        return this.queue.add(payload.type, payload, { priority: 5 });
    }
    sendVerificationEmail(to, token) {
        return this.enqueue({ to, subject: 'Verificación de cuenta', type: EmailJobType.VERIFICATION, data: { token } });
    }
    sendResetPasswordEmail(to, token) {
        return this.enqueue({ to, subject: 'Restablecer contraseña', type: EmailJobType.RESET, data: { token } });
    }
    sendPaymentApprovedEmail(to, boletaNumber) {
        return this.enqueue({ to, subject: 'Pago aprobado', type: EmailJobType.PAYMENT_APPROVED, data: { boletaNumber } });
    }
    sendPaymentRejectedEmail(to, boletaNumber, reason) {
        return this.enqueue({ to, subject: 'Pago rechazado', type: EmailJobType.PAYMENT_REJECTED, data: { boletaNumber, reason } });
    }
    sendEnrollmentConfirmationEmail(to, workshopName, startDate, studentName) {
        return this.enqueue({ to, subject: 'Inscripción confirmada', type: EmailJobType.ENROLLMENT, data: { workshopName, startDate, studentName } });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('emails')),
    __metadata("design:paramtypes", [Object])
], EmailService);
