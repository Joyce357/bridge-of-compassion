/*
  Warnings:

  - You are about to drop the column `image` on the `gallery_items` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `gallery_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gallery_items" DROP COLUMN "image",
ADD COLUMN     "altText" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "category" SET DEFAULT 'Community';
