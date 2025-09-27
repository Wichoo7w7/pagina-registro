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
exports.PaymentEventsListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const payment_events_constants_1 = require("../events/payment-events.constants");
const email_service_1 = require("../../notifications/services/email.service");
let PaymentEventsListener = class PaymentEventsListener {
    constructor(email) {
        this.email = email;
    }
    handleApproved(payload) {
        this.email.sendPaymentApprovedEmail(payload.userEmail, payload.boletaNumber);
    }
    handleRejected(payload) {
        this.email.sendPaymentRejectedEmail(payload.userEmail, payload.boletaNumber, payload.reason);
    }
};
exports.PaymentEventsListener = PaymentEventsListener;
__decorate([
    (0, event_emitter_1.OnEvent)(payment_events_constants_1.PAYMENT_EVENTS.APPROVED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentEventsListener.prototype, "handleApproved", null);
__decorate([
    (0, event_emitter_1.OnEvent)(payment_events_constants_1.PAYMENT_EVENTS.REJECTED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentEventsListener.prototype, "handleRejected", null);
exports.PaymentEventsListener = PaymentEventsListener = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService])
], PaymentEventsListener);
