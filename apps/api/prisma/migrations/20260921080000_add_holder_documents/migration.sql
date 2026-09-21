CREATE TABLE "holder_documents" (
  "id" UUID NOT NULL,
  "holder_id" UUID NOT NULL,
  "category" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "file_url" TEXT,
  "expires_at" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "holder_documents_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "holder_documents_holder_id_fkey"
    FOREIGN KEY ("holder_id")
    REFERENCES "holders"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX "holder_documents_holder_id_idx"
ON "holder_documents"("holder_id");