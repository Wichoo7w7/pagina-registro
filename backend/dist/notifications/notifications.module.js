"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const EmailLog_1 = require("../entities/EmailLog");
const email_service_1 = require("./services/email.service");
const template_service_1 = require("./services/template.service");
const email_processor_1 = require("./processors/email.processor");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([EmailLog_1.EmailLog]),
            bull_1.BullModule.registerQueueAsync({
                name: 'emails',
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: parseInt(config.get('REDIS_PORT', '6379'), 10),
                        password: config.get('REDIS_PASSWORD') || undefined
                    },
                    defaultJobOptions: {
                        attempts: 5,
                        backoff: { type: 'exponential', delay: 3000 },
                        removeOnComplete: 1000,
                        removeOnFail: false
                    }
                })
            })
        ],
        providers: [email_service_1.EmailService, template_service_1.TemplateService, email_processor_1.EmailProcessor],
        exports: [email_service_1.EmailService]
    })
], NotificationsModule);
