-- CreateEnum
CREATE TYPE "ProductTier" AS ENUM ('LUXE', 'EVERYDAY', 'BUDGET');

-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('HOME', 'BROWSE', 'STORE');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "retailer" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "priceLabel" TEXT NOT NULL DEFAULT '',
    "tier" "ProductTier" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imagePath" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "placements" "AdPlacement"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_active_tier_idx" ON "Product"("active", "tier");

