-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Ingredient_isActive_idx" ON "Ingredient"("isActive");
