/*
  Warnings:

  - You are about to drop the column `endDate` on the `Issue` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Issue` table. All the data in the column will be lost.
  - Made the column `projectId` on table `Issue` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reporterId` on table `Issue` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "GlobalRole" ADD VALUE 'REHBER';

-- DropForeignKey
ALTER TABLE "public"."Issue" DROP CONSTRAINT "Issue_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Issue" DROP CONSTRAINT "Issue_reporterId_fkey";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "endDate",
DROP COLUMN "startDate",
ALTER COLUMN "projectId" SET NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "reporterId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
