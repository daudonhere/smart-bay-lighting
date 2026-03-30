/*
  Warnings:

  - You are about to drop the column `name` on the `Bay` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Bay" ("createdAt", "id", "isActive", "updatedAt") SELECT "createdAt", "id", "isActive", "updatedAt" FROM "Bay";
DROP TABLE "Bay";
ALTER TABLE "new_Bay" RENAME TO "Bay";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
