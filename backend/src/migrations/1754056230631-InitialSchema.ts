import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1754056230631 implements MigrationInterface {
    name = 'InitialSchema1754056230631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'USER', 'READ_ONLY', 'CUSTOM')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid, "updated_by" uuid, "email" character varying NOT NULL, "password" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "isActive" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP, "avatar" character varying, "phone_number" character varying, "department" character varying, "job_title" character varying, "timezone" character varying NOT NULL DEFAULT 'UTC', "language" character varying NOT NULL DEFAULT 'en', "is_email_verified" boolean NOT NULL DEFAULT false, "email_verification_token" character varying, "email_verification_expires" TIMESTAMP, "password_reset_token" character varying, "password_reset_expires" TIMESTAMP, "refresh_token" character varying, "deactivated_at" TIMESTAMP, "deactivated_by" uuid, "new_email" character varying, "email_change_token" character varying, "email_change_token_expires" TIMESTAMP, "settings" jsonb, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "incident_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid, "updated_by" uuid, "content" text NOT NULL, "is_internal" boolean NOT NULL DEFAULT false, "user_id" uuid NOT NULL, "incident_id" uuid NOT NULL, CONSTRAINT "PK_a17275da5243738996bbba7327d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."incidents_status_enum" AS ENUM('open', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."incidents_priority_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TYPE "public"."incidents_impact_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TABLE "incidents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid, "updated_by" uuid, "title" character varying(255) NOT NULL, "description" text, "status" "public"."incidents_status_enum" NOT NULL DEFAULT 'open', "priority" "public"."incidents_priority_enum" NOT NULL DEFAULT 'medium', "impact" "public"."incidents_impact_enum" NOT NULL DEFAULT 'medium', "assigned_to_id" uuid, "reported_by_id" uuid NOT NULL, "resolved_at" TIMESTAMP, "resolution_notes" text, "metadata" jsonb, CONSTRAINT "PK_ccb34c01719889017e2246469f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."problems_status_enum" AS ENUM('identified', 'analyzing', 'root_cause_identified', 'workaround_available', 'resolved', 'closed', 'reopened')`);
        await queryRunner.query(`CREATE TYPE "public"."problems_priority_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TYPE "public"."problems_impact_enum" AS ENUM('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TABLE "problems" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL DEFAULT '1', "is_deleted" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid, "updated_by" uuid, "title" character varying NOT NULL, "description" text NOT NULL, "status" "public"."problems_status_enum" NOT NULL DEFAULT 'identified', "priority" "public"."problems_priority_enum" NOT NULL DEFAULT 'medium', "impact" "public"."problems_impact_enum" NOT NULL DEFAULT 'medium', "reported_by_id" uuid NOT NULL, "assigned_to_id" uuid, "rootCause" text, "solution" text, "resolvedAt" TIMESTAMP, "relatedIncidentIds" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_b3994afba6ab64a42cda1ccaeff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "incident_comments" ADD CONSTRAINT "FK_3792b114287a98d1e64772f0d78" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incident_comments" ADD CONSTRAINT "FK_5575c3f58b513060955586187ea" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_9036c3f88d411562af1241e404b" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "incidents" ADD CONSTRAINT "FK_3f25378f332890bea45df59b5e1" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "problems" ADD CONSTRAINT "FK_003898efa01135d14623d4148c0" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "problems" ADD CONSTRAINT "FK_eb6dc4b4a21488093c9fdfff208" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "problems" DROP CONSTRAINT "FK_eb6dc4b4a21488093c9fdfff208"`);
        await queryRunner.query(`ALTER TABLE "problems" DROP CONSTRAINT "FK_003898efa01135d14623d4148c0"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_3f25378f332890bea45df59b5e1"`);
        await queryRunner.query(`ALTER TABLE "incidents" DROP CONSTRAINT "FK_9036c3f88d411562af1241e404b"`);
        await queryRunner.query(`ALTER TABLE "incident_comments" DROP CONSTRAINT "FK_5575c3f58b513060955586187ea"`);
        await queryRunner.query(`ALTER TABLE "incident_comments" DROP CONSTRAINT "FK_3792b114287a98d1e64772f0d78"`);
        await queryRunner.query(`DROP TABLE "problems"`);
        await queryRunner.query(`DROP TYPE "public"."problems_impact_enum"`);
        await queryRunner.query(`DROP TYPE "public"."problems_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."problems_status_enum"`);
        await queryRunner.query(`DROP TABLE "incidents"`);
        await queryRunner.query(`DROP TYPE "public"."incidents_impact_enum"`);
        await queryRunner.query(`DROP TYPE "public"."incidents_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."incidents_status_enum"`);
        await queryRunner.query(`DROP TABLE "incident_comments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
