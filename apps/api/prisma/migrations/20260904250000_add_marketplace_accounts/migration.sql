-- CreateEnum
CREATE TYPE "MarketplaceAccountStatus" AS ENUM ('ACTIVE', 'PENDING', 'DISCONNECTED', 'BLOCKED', 'ERROR', 'INACTIVE');

-- CreateTable
CREATE TABLE "marketplaces" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketplaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_marketplace_accounts" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "marketplace_id" UUID NOT NULL,
    "status" "MarketplaceAccountStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "last_checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_marketplace_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketplaces_code_key" ON "marketplaces"("code");
CREATE UNIQUE INDEX "company_marketplace_accounts_company_id_marketplace_id_key" ON "company_marketplace_accounts"("company_id", "marketplace_id");
CREATE INDEX "company_marketplace_accounts_status_idx" ON "company_marketplace_accounts"("status");

-- AddForeignKey
ALTER TABLE "company_marketplace_accounts" ADD CONSTRAINT "company_marketplace_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "company_marketplace_accounts" ADD CONSTRAINT "company_marketplace_accounts_marketplace_id_fkey" FOREIGN KEY ("marketplace_id") REFERENCES "marketplaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
