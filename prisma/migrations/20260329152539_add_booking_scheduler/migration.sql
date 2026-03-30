/*
  Warnings:

  - You are about to drop the column `isActive` on the `Bay` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relayPin" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Bay" ("createdAt", "id", "relayPin", "updatedAt") SELECT "createdAt", "id", "relayPin", "updatedAt" FROM "Bay";
DROP TABLE "Bay";
ALTER TABLE "new_Bay" RENAME TO "Bay";
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bayId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Booking" ("bayId", "createdAt", "customerName", "endTime", "id", "startTime", "status", "updatedAt") SELECT "bayId", "createdAt", "customerName", "endTime", "id", "startTime", "status", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_bayId_idx" ON "Booking"("bayId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_startTime_idx" ON "Booking"("startTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
