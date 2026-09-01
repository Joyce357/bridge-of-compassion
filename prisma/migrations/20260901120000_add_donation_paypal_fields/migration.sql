-- AlterEnum
ALTER TYPE "DonationStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';

-- AlterTable
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "paypalOrderId" TEXT,
ADD COLUMN IF NOT EXISTS "paypalCaptureId" TEXT,
ADD COLUMN IF NOT EXISTS "paypalPayerId" TEXT,
ADD COLUMN IF NOT EXISTS "paypalPayerEmail" TEXT,
ADD COLUMN IF NOT EXISTS "receiptSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "receiptSentAt" TIMESTAMP(3);

ALTER TABLE "donations" ALTER COLUMN "paymentProvider" SET DEFAULT 'paypal';

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "donations_paypalOrderId_key" ON "donations"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "donations_paypalCaptureId_key" ON "donations"("paypalCaptureId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "donations_createdAt_idx" ON "donations"("createdAt");
