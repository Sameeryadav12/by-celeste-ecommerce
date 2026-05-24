-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;

-- Backfill existing orders (oldest first → BC-1000, BC-1001, …)
WITH numbered AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) + 999)::INTEGER AS num
  FROM "Order"
)
UPDATE "Order" o
SET "orderNumber" = numbered.num
FROM numbered
WHERE o.id = numbered.id;

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
