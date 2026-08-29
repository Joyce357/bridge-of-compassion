-- AlterTable
ALTER TABLE "contact_submissions" ADD COLUMN     "adminNotes" TEXT;

-- CreateTable
CREATE TABLE "contact_communications" (
    "id" TEXT NOT NULL,
    "contactSubmissionId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "sentByUserId" TEXT,
    "sentByName" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'SENT',
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_communications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contact_communications" ADD CONSTRAINT "contact_communications_contactSubmissionId_fkey" FOREIGN KEY ("contactSubmissionId") REFERENCES "contact_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
