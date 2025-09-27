"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1700000000000 = void 0;
class InitSchema1700000000000 {
    constructor() {
        this.name = 'InitSchema1700000000000';
    }
    async up(queryRunner) {
        // Enums
        await queryRunner.query(`CREATE TYPE "public"."roles_name_enum" AS ENUM('admin', 'student')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        // Tables
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "deletedAt" TIMESTAMPTZ, "name" "public"."roles_name_enum" NOT NULL, "description" character varying(150) NOT NULL, CONSTRAINT "UQ_role_name" UNIQUE ("name"), CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "deletedAt" TIMESTAMPTZ, "email" character varying(180) NOT NULL, "password" character varying(255) NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "verificationToken" character varying(255), "resetToken" character varying(255), "student_profile_id" uuid, CONSTRAINT "UQ_user_email" UNIQUE ("email"), CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "student_profiles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "deletedAt" TIMESTAMPTZ, "nombreCompleto" character varying(150) NOT NULL, "carnet" character varying(30) NOT NULL, "facultad" character varying(120) NOT NULL, "telefono" character varying(25), "user_id" uuid, CONSTRAINT "UQ_student_carnet" UNIQUE ("carnet"), CONSTRAINT "PK_student_profiles_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "deletedAt" TIMESTAMPTZ, "boletaNumber" character varying(80) NOT NULL, "boletaDate" date NOT NULL, "boletaImage" character varying(255) NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "rejectionReason" character varying(255), "userId" uuid, CONSTRAINT "UQ_payment_boleta_number" UNIQUE ("boletaNumber"), CONSTRAINT "PK_payments_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workshops" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "deletedAt" TIMESTAMPTZ, "nombre" character varying(150) NOT NULL, "descripcion" text NOT NULL, "instructor" character varying(120) NOT NULL, "cupoMaximo" integer NOT NULL, "cuposDisponibles" integer NOT NULL, "fechaInicio" TIMESTAMPTZ NOT NULL, "fechaFin" TIMESTAMPTZ NOT NULL, "horario" character varying(120) NOT NULL, "lugar" character varying(150) NOT NULL, "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_workshops_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "deletedAt" TIMESTAMPTZ, "qrCode" character varying(120) NOT NULL, "attendance" boolean NOT NULL DEFAULT false, "enrollmentDate" TIMESTAMPTZ NOT NULL, "userId" uuid, "workshopId" uuid, CONSTRAINT "UQ_enrollment_qrcode" UNIQUE ("qrCode"), CONSTRAINT "PK_enrollments_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id"))`);
        // Indexes
        await queryRunner.query(`CREATE INDEX "IDX_workshop_nombre" ON "workshops" ("nombre")`);
        await queryRunner.query(`CREATE INDEX "IDX_workshop_activo" ON "workshops" ("activo")`);
        await queryRunner.query(`CREATE INDEX "IDX_enrollment_user_workshop" ON "enrollments" ("userId", "workshopId")`);
        // FKs
        await queryRunner.query(`ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_student_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_student_profile" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_workshop" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_role"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_user"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_workshop"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_user"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_user"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_student_profile"`);
        await queryRunner.query(`ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_student_profiles_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_enrollment_user_workshop"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_workshop_activo"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_workshop_nombre"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TABLE "workshops"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "student_profiles"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
    }
}
exports.InitSchema1700000000000 = InitSchema1700000000000;
