-- AlterTable
ALTER TABLE "device_current_status" ADD COLUMN "last_latitude" DOUBLE PRECISION;
ALTER TABLE "device_current_status" ADD COLUMN "last_longitude" DOUBLE PRECISION;
ALTER TABLE "device_current_status" ADD COLUMN "last_location_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "device_location_history" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "captured_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_location_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_location_history_device_id_captured_at_idx" ON "device_location_history"("device_id", "captured_at");

-- AddForeignKey
ALTER TABLE "device_location_history" ADD CONSTRAINT "device_location_history_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
