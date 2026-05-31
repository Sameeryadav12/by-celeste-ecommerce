-- AlterTable: add discount snapshot fields to Order
ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "discountPercentage" INTEGER;
ALTER TABLE "Order" ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable: DiscountCoupon
CREATE TABLE "DiscountCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliesToCustomers" BOOLEAN NOT NULL DEFAULT true,
    "appliesToWholesale" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "totalUsageLimit" INTEGER,
    "perCustomerLimit" INTEGER DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCoupon_code_key" ON "DiscountCoupon"("code");
CREATE INDEX "DiscountCoupon_isActive_idx" ON "DiscountCoupon"("isActive");
CREATE INDEX "DiscountCoupon_endsAt_idx" ON "DiscountCoupon"("endsAt");

-- CreateTable: DiscountCouponUsage
CREATE TABLE "DiscountCouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscountCouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscountCouponUsage_couponId_idx" ON "DiscountCouponUsage"("couponId");
CREATE INDEX "DiscountCouponUsage_userId_idx" ON "DiscountCouponUsage"("userId");
CREATE INDEX "DiscountCouponUsage_email_idx" ON "DiscountCouponUsage"("email");
CREATE INDEX "DiscountCouponUsage_orderId_idx" ON "DiscountCouponUsage"("orderId");

-- Unique: at most one usage row per (coupon, order) to make webhook retries idempotent
CREATE UNIQUE INDEX "DiscountCouponUsage_couponId_orderId_key"
    ON "DiscountCouponUsage"("couponId", "orderId")
    WHERE "orderId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "DiscountCouponUsage" ADD CONSTRAINT "DiscountCouponUsage_couponId_fkey"
    FOREIGN KEY ("couponId") REFERENCES "DiscountCoupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DiscountCouponUsage" ADD CONSTRAINT "DiscountCouponUsage_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
