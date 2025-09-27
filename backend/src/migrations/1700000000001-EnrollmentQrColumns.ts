import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class EnrollmentQrColumns1700000000001 implements MigrationInterface {
  name = 'EnrollmentQrColumns1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('enrollments', [
      new TableColumn({
        name: 'qr_token',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'attendance_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('enrollments', 'attendance_at');
    await queryRunner.dropColumn('enrollments', 'qr_token');
  }
}
