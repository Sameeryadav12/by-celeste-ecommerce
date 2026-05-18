-- AlterTable
ALTER TABLE "Product" ADD COLUMN "shopSortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_shopSortOrder_idx" ON "Product"("shopSortOrder");
