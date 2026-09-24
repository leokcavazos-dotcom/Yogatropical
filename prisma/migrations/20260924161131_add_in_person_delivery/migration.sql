-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('VIRTUAL', 'IN_PERSON');

-- AlterTable
ALTER TABLE "ClassSession" ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'VIRTUAL',
ADD COLUMN     "locationAddress" TEXT,
ALTER COLUMN "videoRoomSlug" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InstructorProfile" ADD COLUMN     "inPersonCapacity" INTEGER,
ADD COLUMN     "inPersonDurationMinutes" INTEGER,
ADD COLUMN     "inPersonPricePerStudent" DOUBLE PRECISION,
ADD COLUMN     "offersInPerson" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "travelServiceArea" TEXT;
