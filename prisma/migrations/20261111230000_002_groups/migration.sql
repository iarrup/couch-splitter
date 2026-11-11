CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Group_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "GroupMember" (
    "groupId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupMember_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("groupId", "accountId")
);
CREATE UNIQUE INDEX "Group_creatorId_name_key" ON "Group"("creatorId", "name");
CREATE INDEX "Group_creatorId_idx" ON "Group"("creatorId");
CREATE INDEX "GroupMember_accountId_idx" ON "GroupMember"("accountId");
