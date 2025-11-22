/*
  Warnings:

  - You are about to drop the column `unit` on the `RecipeItem` table. All the data in the column will be lost.
  - Added the required column `unitId` to the `RecipeItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Ingredient" ADD COLUMN     "defaultUnitId" TEXT;

-- AlterTable
ALTER TABLE "public"."RecipeItem" DROP COLUMN "unit",
ADD COLUMN     "unitId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Unit" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_defaultUnitId_fkey" FOREIGN KEY ("defaultUnitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeItem" ADD CONSTRAINT "RecipeItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
