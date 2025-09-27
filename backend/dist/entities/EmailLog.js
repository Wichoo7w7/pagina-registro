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
exports.EmailLog = exports.EmailStatus = void 0;
const typeorm_1 = require("typeorm");
const BaseEntityWithTimestamps_1 = require("./BaseEntityWithTimestamps");
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["PENDING"] = "pending";
    EmailStatus["SENT"] = "sent";
    EmailStatus["FAILED"] = "failed";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
let EmailLog = class EmailLog extends BaseEntityWithTimestamps_1.BaseEntityWithTimestamps {
};
exports.EmailLog = EmailLog;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 180 }),
    __metadata("design:type", String)
], EmailLog.prototype, "to", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], EmailLog.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 60 }),
    __metadata("design:type", String)
], EmailLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EmailStatus, default: EmailStatus.PENDING }),
    __metadata("design:type", String)
], EmailLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], EmailLog.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], EmailLog.prototype, "lastError", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], EmailLog.prototype, "meta", void 0);
exports.EmailLog = EmailLog = __decorate([
    (0, typeorm_1.Entity)('email_logs'),
    (0, typeorm_1.Index)('IDX_email_logs_type_status', ['type', 'status']),
    (0, typeorm_1.Index)('IDX_email_logs_createdAt', ['createdAt'])
], EmailLog);
