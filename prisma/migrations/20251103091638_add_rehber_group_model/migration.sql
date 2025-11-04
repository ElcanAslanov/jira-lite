-- CreateTable
CREATE TABLE "RehberGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "RehberGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RehberGroup_userId_departmentId_key" ON "RehberGroup"("userId", "departmentId");

-- AddForeignKey
ALTER TABLE "RehberGroup" ADD CONSTRAINT "RehberGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehberGroup" ADD CONSTRAINT "RehberGroup_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
