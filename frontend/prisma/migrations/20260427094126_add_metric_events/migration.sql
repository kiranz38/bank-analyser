-- CreateTable
CREATE TABLE "MetricEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "sessionId" TEXT,
    "email" TEXT,
    "valueUsd" DOUBLE PRECISION,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetricEvent_event_idx" ON "MetricEvent"("event");

-- CreateIndex
CREATE INDEX "MetricEvent_sessionId_idx" ON "MetricEvent"("sessionId");

-- CreateIndex
CREATE INDEX "MetricEvent_createdAt_idx" ON "MetricEvent"("createdAt");
