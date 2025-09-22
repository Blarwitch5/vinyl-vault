-- DropForeignKey
ALTER TABLE "public"."vinyls" DROP CONSTRAINT "vinyls_collectionId_fkey";

-- AlterTable
ALTER TABLE "public"."vinyls" ADD COLUMN     "listened" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listenedAt" TIMESTAMP(3),
ADD COLUMN     "userRating" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."vinyls" ADD CONSTRAINT "vinyls_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
