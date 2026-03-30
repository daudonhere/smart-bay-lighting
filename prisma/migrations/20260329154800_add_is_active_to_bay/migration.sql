-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relayPin" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Bay" ("createdAt", "id", "relayPin", "updatedAt") SELECT "createdAt", "id", "relayPin", "updatedAt" FROM "Bay";
DROP TABLE "Bay";
ALTER TABLE "new_Bay" RENAME TO "Bay";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
