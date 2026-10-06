-- CreateEnum
CREATE TYPE "UnitDimension" AS ENUM ('MASS', 'VOLUME', 'COUNT', 'PACKAGE');

-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN     "baseUnitId" UUID,
ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "purchaseUnitId" UUID;

-- CreateTable
CREATE TABLE "MaterialCategory" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MaterialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "dimension" "UnitDimension" NOT NULL,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitConversion" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "fromUnitId" UUID NOT NULL,
    "toUnitId" UUID NOT NULL,
    "factor" DECIMAL(24,9) NOT NULL,
    "materialId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaterialCategory_organizationId_idx" ON "MaterialCategory"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCategory_organizationId_name_key" ON "MaterialCategory"("organizationId", "name");

-- CreateIndex
CREATE INDEX "Unit_organizationId_dimension_idx" ON "Unit"("organizationId", "dimension");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_organizationId_code_key" ON "Unit"("organizationId", "code");

-- CreateIndex
CREATE INDEX "UnitConversion_organizationId_fromUnitId_toUnitId_idx" ON "UnitConversion"("organizationId", "fromUnitId", "toUnitId");

-- CreateIndex
CREATE INDEX "UnitConversion_materialId_idx" ON "UnitConversion"("materialId");

-- AddForeignKey
ALTER TABLE "MaterialCategory" ADD CONSTRAINT "MaterialCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_fromUnitId_fkey" FOREIGN KEY ("fromUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_toUnitId_fkey" FOREIGN KEY ("toUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitConversion" ADD CONSTRAINT "UnitConversion_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MaterialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_baseUnitId_fkey" FOREIGN KEY ("baseUnitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_purchaseUnitId_fkey" FOREIGN KEY ("purchaseUnitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

