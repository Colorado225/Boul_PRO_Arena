-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchasePaymentType" AS ENUM ('CASH', 'CREDIT');

-- CreateEnum
CREATE TYPE "ReceiptQualityStatus" AS ENUM ('ACCEPTED', 'REJECTED');

-- DropIndex
DROP INDEX "Supplier_organizationId_idx";

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "address" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "leadTimeDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentTermsDays" INTEGER NOT NULL DEFAULT 0;

-- Preserve existing suppliers while introducing a tenant-scoped business reference.
UPDATE "Supplier" SET "code" = 'SUP-' || UPPER(SUBSTRING(REPLACE("id"::text, '-', '') FROM 1 FOR 8)) WHERE "code" IS NULL;
ALTER TABLE "Supplier" ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "lotId" UUID;

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'ORDERED',
    "paymentType" "PurchasePaymentType" NOT NULL DEFAULT 'CASH',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedAt" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3),
    "transportCost" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "taxCost" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "otherCost" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(18,6) NOT NULL,
    "total" DECIMAL(18,6) NOT NULL,
    "notes" TEXT,
    "createdBy" UUID NOT NULL,
    "receivedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLine" (
    "id" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "orderedQuantity" DECIMAL(18,6) NOT NULL,
    "receivedQuantity" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "purchaseUnitId" UUID NOT NULL,
    "unitPrice" DECIMAL(18,6) NOT NULL,
    "lineSubtotal" DECIMAL(18,6) NOT NULL,
    "quantityInBaseUnit" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "landedCost" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "unitCostInBaseUnit" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLot" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "siteId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "purchaseOrderId" UUID NOT NULL,
    "purchaseLineId" UUID NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "receivedQuantity" DECIMAL(18,6) NOT NULL,
    "remainingQuantity" DECIMAL(18,6) NOT NULL,
    "unitCost" DECIMAL(18,6) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "qualityStatus" "ReceiptQualityStatus" NOT NULL DEFAULT 'ACCEPTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseOrder_organizationId_status_orderedAt_idx" ON "PurchaseOrder"("organizationId", "status", "orderedAt");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_orderedAt_idx" ON "PurchaseOrder"("supplierId", "orderedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_organizationId_reference_key" ON "PurchaseOrder"("organizationId", "reference");

-- CreateIndex
CREATE INDEX "PurchaseLine_materialId_createdAt_idx" ON "PurchaseLine"("materialId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseLine_purchaseOrderId_materialId_key" ON "PurchaseLine"("purchaseOrderId", "materialId");

-- CreateIndex
CREATE INDEX "StockLot_organizationId_siteId_expiresAt_idx" ON "StockLot"("organizationId", "siteId", "expiresAt");

-- CreateIndex
CREATE INDEX "StockLot_materialId_createdAt_idx" ON "StockLot"("materialId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StockLot_organizationId_siteId_materialId_lotNumber_key" ON "StockLot"("organizationId", "siteId", "materialId", "lotNumber");

-- CreateIndex
CREATE INDEX "Supplier_organizationId_name_idx" ON "Supplier"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_organizationId_code_key" ON "Supplier"("organizationId", "code");

-- CreateIndex
CREATE INDEX "StockMovement_lotId_createdAt_idx" ON "StockMovement"("lotId", "createdAt");

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_purchaseUnitId_fkey" FOREIGN KEY ("purchaseUnitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLot" ADD CONSTRAINT "StockLot_purchaseLineId_fkey" FOREIGN KEY ("purchaseLineId") REFERENCES "PurchaseLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "StockLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

