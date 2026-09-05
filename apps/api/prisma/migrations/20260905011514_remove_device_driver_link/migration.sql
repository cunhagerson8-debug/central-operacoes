-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_driver_id_fkey";

-- DropIndex
DROP INDEX "devices_driver_id_idx";
