-- Make company holder optional
ALTER TABLE "companies"
ALTER COLUMN "holder_id" DROP NOT NULL;


-- CreateEnum
CREATE TYPE "PaymentCategory" AS ENUM ('PJ', 'ACCOUNTING', 'TEAM', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM');

-- CreateTable
CREATE TABLE "payment_beneficiaries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "pix_key" TEXT,
    "pix_key_type" "PixKeyType",
    "bank_name" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "company_id" UUID,
    "category" "PaymentCategory" NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "due_day" INTEGER,
    "reference_month" INTEGER NOT NULL,
    "reference_year" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_beneficiary_id_idx" ON "payments"("beneficiary_id");

-- CreateIndex
CREATE INDEX "payments_company_id_idx" ON "payments"("company_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_reference_year_reference_month_idx"
ON "payments"("reference_year", "reference_month");

-- AddForeignKey
ALTER TABLE "payments"
ADD CONSTRAINT "payments_beneficiary_id_fkey"
FOREIGN KEY ("beneficiary_id")
REFERENCES "payment_beneficiaries"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"
ADD CONSTRAINT "payments_company_id_fkey"
FOREIGN KEY ("company_id")
REFERENCES "companies"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;