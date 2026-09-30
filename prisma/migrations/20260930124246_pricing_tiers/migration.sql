-- AlterTable
ALTER TABLE "InstructorProfile" ADD COLUMN     "country" TEXT;

-- AlterTable
ALTER TABLE "PlatformSettings" DROP COLUMN "maxMarkupPercent";

-- DropTable
DROP TABLE "PriceFloor";

