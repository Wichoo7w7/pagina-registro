"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentQrColumns1700000000001 = void 0;
const typeorm_1 = require("typeorm");
class EnrollmentQrColumns1700000000001 {
    constructor() {
        this.name = 'EnrollmentQrColumns1700000000001';
    }
    async up(queryRunner) {
        await queryRunner.addColumns('enrollments', [
            new typeorm_1.TableColumn({
                name: 'qr_token',
                type: 'text',
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: 'attendance_at',
                type: 'timestamptz',
                isNullable: true,
            }),
        ]);
    }
    async down(queryRunner) {
        await queryRunner.dropColumn('enrollments', 'attendance_at');
        await queryRunner.dropColumn('enrollments', 'qr_token');
    }
}
exports.EnrollmentQrColumns1700000000001 = EnrollmentQrColumns1700000000001;
