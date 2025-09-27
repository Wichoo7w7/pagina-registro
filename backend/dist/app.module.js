"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const typeorm_1 = require("@nestjs/typeorm");
const User_1 = require("./entities/User");
const StudentProfile_1 = require("./entities/StudentProfile");
const Role_1 = require("./entities/Role");
const Payment_1 = require("./entities/Payment");
const Workshop_1 = require("./entities/Workshop");
const Enrollment_1 = require("./entities/Enrollment");
const auth_module_1 = require("./auth/auth.module");
const payments_module_1 = require("./payments/payments.module");
const workshops_module_1 = require("./workshops/workshops.module");
const admin_module_1 = require("./admin/admin.module");
const notifications_module_1 = require("./notifications/notifications.module");
const EmailLog_1 = require("./entities/EmailLog");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [{
                        ttl: config.get('THROTTLE_TTL', 60),
                        limit: config.get('THROTTLE_LIMIT', 20)
                    }]
            }),
            event_emitter_1.EventEmitterModule.forRoot({
                delimiter: '.',
                wildcard: false,
                maxListeners: 20
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: parseInt(config.get('DB_PORT', '5432'), 10),
                    username: config.get('DB_USER', 'app_user'),
                    password: config.get('DB_PASSWORD', 'app_password_change_me'),
                    database: config.get('DB_NAME', 'app_db'),
                    entities: [User_1.User, StudentProfile_1.StudentProfile, Role_1.Role, Payment_1.Payment, Workshop_1.Workshop, Enrollment_1.Enrollment, EmailLog_1.EmailLog],
                    synchronize: false,
                    logging: config.get('TYPEORM_LOGGING') === 'true'
                })
            }),
            auth_module_1.AuthModule,
            payments_module_1.PaymentsModule,
            workshops_module_1.WorkshopsModule,
            admin_module_1.AdminModule,
            notifications_module_1.NotificationsModule
        ],
        controllers: [],
        providers: []
    })
], AppModule);
