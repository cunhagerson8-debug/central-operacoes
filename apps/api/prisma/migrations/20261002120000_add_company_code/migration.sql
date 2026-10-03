-- AlterTable
ALTER TABLE "companies" ADD COLUMN "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- Copia o código dos cadastros INT-xxxx sem alterar "document"
UPDATE "companies"
SET "code" = substring("document" from 5)
WHERE "document_type" = 'INTERNAL'
  AND "document" ~ '^INT-.+'
  AND "code" IS NULL;
