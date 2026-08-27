-- AlterTable
ALTER TABLE "events" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Environmental',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shortDescription" TEXT;
