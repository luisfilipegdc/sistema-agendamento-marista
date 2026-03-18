-- CreateTable
CREATE TABLE "UnitScheduleSlot" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "period" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isReservable" BOOLEAN NOT NULL DEFAULT true,
    "unitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnitScheduleSlot_unitId_sortOrder_idx" ON "UnitScheduleSlot"("unitId", "sortOrder");

-- AddForeignKey
ALTER TABLE "UnitScheduleSlot" ADD CONSTRAINT "UnitScheduleSlot_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
