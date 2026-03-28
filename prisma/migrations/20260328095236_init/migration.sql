-- CreateTable
CREATE TABLE "Bay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bayId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "Bay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Bay_name_key" ON "Bay"("name");

-- CreateIndex
CREATE INDEX "Booking_bayId_idx" ON "Booking"("bayId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
