-- CreateEnum
CREATE TYPE "WholesaleApprovalStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "wholesaleApprovalStatus" "WholesaleApprovalStatus" NOT NULL DEFAULT 'NONE';
ALTER TABLE "User" ADD COLUMN "businessName" TEXT;
ALTER TABLE "User" ADD COLUMN "abn" TEXT;
ALTER TABLE "User" ADD COLUMN "wholesaleNotes" TEXT;
ALTER TABLE "User" ADD COLUMN "approvedAt" TIMESTAMP(3);

-- Existing wholesale-role accounts: treat as awaiting review (admin can approve later)
UPDATE "User" SET "wholesaleApprovalStatus" = 'PENDING' WHERE "role" = 'WHOLESALE';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "wholesalePrice" DECIMAL(10,2);

CREATE INDEX "User_wholesaleApprovalStatus_idx" ON "User"("wholesaleApprovalStatus");
