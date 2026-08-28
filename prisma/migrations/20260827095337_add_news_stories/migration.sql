-- AlterTable
ALTER TABLE "news_posts" ADD COLUMN     "category" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "imagePublicId" TEXT,
ALTER COLUMN "excerpt" DROP NOT NULL;
