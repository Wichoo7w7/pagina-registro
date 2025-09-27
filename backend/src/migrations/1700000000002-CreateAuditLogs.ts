import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuditLogs1700000000002 implements MigrationInterface {
  name = 'CreateAuditLogs1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
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
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_audit_entity_action', columnNames: ['entity', 'action'] }));
    await queryRunner.createIndex('audit_logs', new TableIndex({ name: 'IDX_audit_user', columnNames: ['performedBy'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_user');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_entity_action');
    await queryRunner.dropTable('audit_logs');
  }
}
