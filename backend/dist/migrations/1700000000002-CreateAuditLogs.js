"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAuditLogs1700000000002 = void 0;
const typeorm_1 = require("typeorm");
class CreateAuditLogs1700000000002 {
    constructor() {
        this.name = 'CreateAuditLogs1700000000002';
    }
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'audit_logs',
            columns: [
                { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
                { name: 'entity', type: 'varchar', length: '80', isNullable: false },
                { name: 'action', type: 'varchar', length: '50', isNullable: false },
                { name: 'details', type: 'jsonb', isNullable: true },
                { name: 'performedBy', type: 'uuid', isNullable: true },
                { name: 'ipAddress', type: 'varchar', length: '45', isNullable: true },
                { name: 'createdAt', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                { name: 'updatedAt', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                { name: 'deletedAt', type: 'timestamptz', isNullable: true },
            ]
        }));
        await queryRunner.createIndex('audit_logs', new typeorm_1.TableIndex({ name: 'IDX_audit_entity_action', columnNames: ['entity', 'action'] }));
        await queryRunner.createIndex('audit_logs', new typeorm_1.TableIndex({ name: 'IDX_audit_user', columnNames: ['performedBy'] }));
    }
    async down(queryRunner) {
        await queryRunner.dropIndex('audit_logs', 'IDX_audit_user');
        await queryRunner.dropIndex('audit_logs', 'IDX_audit_entity_action');
        await queryRunner.dropTable('audit_logs');
    }
}
exports.CreateAuditLogs1700000000002 = CreateAuditLogs1700000000002;
