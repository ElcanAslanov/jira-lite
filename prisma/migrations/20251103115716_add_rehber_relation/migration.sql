-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rehberId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rehberId_fkey" FOREIGN KEY ("rehberId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
