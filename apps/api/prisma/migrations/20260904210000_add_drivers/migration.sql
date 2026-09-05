-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "drivers" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_companies" (
    "driver_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,

    CONSTRAINT "driver_companies_pkey" PRIMARY KEY ("driver_id","company_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_cpf_key" ON "drivers"("cpf");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE INDEX "driver_companies_company_id_idx" ON "driver_companies"("company_id");

-- AddForeignKey
ALTER TABLE "driver_companies" ADD CONSTRAINT "driver_companies_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "driver_companies" ADD CONSTRAINT "driver_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
