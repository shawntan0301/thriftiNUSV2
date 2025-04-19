/*
  Warnings:

  - The values [COM1] on the enum `DealMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'OTHERS';

-- AlterEnum
BEGIN;
CREATE TYPE "DealMethod_new" AS ENUM ('DECK', 'COM', 'FASS', 'TERRACE', 'BIZ', 'UTOWN', 'CDE', 'USC', 'VENTUS', 'CLB', 'PGP', 'IT', 'SCIENCE');
ALTER TABLE "Listing" ALTER COLUMN "dealMethods" TYPE "DealMethod_new"[] USING ("dealMethods"::text::"DealMethod_new"[]);
ALTER TYPE "DealMethod" RENAME TO "DealMethod_old";
ALTER TYPE "DealMethod_new" RENAME TO "DealMethod";
DROP TYPE "DealMethod_old";
COMMIT;

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
