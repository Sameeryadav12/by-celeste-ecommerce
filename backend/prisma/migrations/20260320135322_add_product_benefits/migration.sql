-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[];
