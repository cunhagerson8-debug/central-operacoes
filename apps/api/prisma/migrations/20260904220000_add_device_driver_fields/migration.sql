-- AlterTable
ALTER TABLE "devices" ADD COLUMN "driver_id" UUID;
ALTER TABLE "devices" ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE INDEX "devices_driver_id_idx" ON "devices"("driver_id");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
