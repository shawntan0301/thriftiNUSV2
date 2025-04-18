/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the `Cart` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReportTopic" AS ENUM ('PHISHING_SCAMMER', 'SUSPICIOUS_ACCOUNT', 'AN_ITEM_I_SOLD', 'AN_ITEM_I_BOUGHT', 'CANCELLING_ON_DEAL', 'SELLING_PROHIBITED_ITEM', 'MISPRICED_LISTINGS', 'OFFENSIVE_BEHAVIOUR_OR_CONTENT', 'DUPLICATE_POSTS', 'IRRELEVANT_KEYWORDS', 'ITEMS_WRONGLY_CATEGORIZED', 'SELLING_COUNTERFEIT_ITEMS');

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Cart";

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reporteeId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportType" "ReportTopic"[],
    "bodyText" TEXT NOT NULL,
    "reportStatus" "ReportStatus"[],

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_listingId_key" ON "Report"("reporterId", "listingId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
