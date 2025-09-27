"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const StudentProfile_1 = require("./entities/StudentProfile");
const Role_1 = require("./entities/Role");
const Payment_1 = require("./entities/Payment");
const Workshop_1 = require("./entities/Workshop");
const Enrollment_1 = require("./entities/Enrollment");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'app_db',
    entities: [User_1.User, StudentProfile_1.StudentProfile, Role_1.Role, Payment_1.Payment, Workshop_1.Workshop, Enrollment_1.Enrollment],
    migrations: ['src/migrations/*.ts'],
    logging: true,
    synchronize: false,
});
