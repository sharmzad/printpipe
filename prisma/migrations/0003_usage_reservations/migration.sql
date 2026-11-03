ALTER TABLE "Usage"
  ADD COLUMN "requestId" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'completed',
  ADD COLUMN "expiresAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3);

UPDATE "Usage"
SET "completedAt" = "createdAt"
WHERE "status" = 'completed';

CREATE UNIQUE INDEX "Usage_requestId_key" ON "Usage"("requestId");
CREATE INDEX "Usage_status_expiresAt_idx" ON "Usage"("status", "expiresAt");
