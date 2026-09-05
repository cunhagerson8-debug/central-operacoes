-- CreateTable
CREATE TABLE "device_sms_messages" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "device_sms_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_sms_messages_device_id_received_at_idx" ON "device_sms_messages"("device_id", "received_at");
CREATE INDEX "device_sms_messages_read_at_idx" ON "device_sms_messages"("read_at");

-- AddForeignKey
ALTER TABLE "device_sms_messages" ADD CONSTRAINT "device_sms_messages_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
