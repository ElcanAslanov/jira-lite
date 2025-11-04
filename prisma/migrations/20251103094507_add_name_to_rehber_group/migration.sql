/*
  Warnings:

  - You are about to drop the column `userId` on the `RehberGroup` table. All the data in the column will be lost.
  - Added the required column `name` to the `RehberGroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."RehberGroup" DROP CONSTRAINT "RehberGroup_userId_fkey";

-- DropIndex
DROP INDEX "public"."RehberGroup_userId_departmentId_key";

-- AlterTable
ALTER TABLE "RehberGroup" DROP COLUMN "userId",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_UserRehberGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserRehberGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserRehberGroups_B_index" ON "_UserRehberGroups"("B");

-- AddForeignKey
ALTER TABLE "_UserRehberGroups" ADD CONSTRAINT "_UserRehberGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "RehberGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRehberGroups" ADD CONSTRAINT "_UserRehberGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
