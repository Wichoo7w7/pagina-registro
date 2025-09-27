"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmailLogs1700000000003 = void 0;
const typeorm_1 = require("typeorm");
class CreateEmailLogs1700000000003 {
    constructor() {
        this.name = 'CreateEmailLogs1700000000003';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'email_logs',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
                { name: 'to', type: 'varchar', length: '180' },
                { name: 'subject', type: 'varchar', length: '150' },
                { name: 'type', type: 'varchar', length: '60' },
                { name: 'status', type: 'varchar', length: '20', default: `'pending'` },
                { name: 'attempts', type: 'int', default: 0 },
                { name: 'lastError', type: 'text', isNullable: true },
                { name: 'meta', type: 'jsonb', isNullable: true },
                { name: 'createdAt', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                { name: 'deletedAt', type: 'timestamptz', isNullable: true },
            ]
        }));
        await queryRunner.createIndex('email_logs', new typeorm_1.TableIndex({ name: 'IDX_email_logs_type_status', columnNames: ['type', 'status'] }));
        await queryRunner.createIndex('email_logs', new typeorm_1.TableIndex({ name: 'IDX_email_logs_createdAt', columnNames: ['createdAt'] }));
    }
    async down(queryRunner) {
        await queryRunner.dropIndex('email_logs', 'IDX_email_logs_createdAt');
        await queryRunner.dropIndex('email_logs', 'IDX_email_logs_type_status');
        await queryRunner.dropTable('email_logs');
    }
}
exports.CreateEmailLogs1700000000003 = CreateEmailLogs1700000000003;
