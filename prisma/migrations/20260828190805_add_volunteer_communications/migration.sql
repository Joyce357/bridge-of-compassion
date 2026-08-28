-- CreateTable
CREATE TABLE "volunteer_communications" (
    "id" TEXT NOT NULL,
    "volunteerApplicationId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "sentByUserId" TEXT,
    "sentByName" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'SENT',
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_communications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "volunteer_communications" ADD CONSTRAINT "volunteer_communications_volunteerApplicationId_fkey" FOREIGN KEY ("volunteerApplicationId") REFERENCES "volunteer_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
