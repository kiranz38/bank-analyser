-- CreateTable
CREATE TABLE "ProReportDelivery" (
    "id" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "paymentIntentId" TEXT,
    "email" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "pdfStatus" TEXT NOT NULL DEFAULT 'pending',
    "emailStatus" TEXT NOT NULL DEFAULT 'pending',
    "reportId" TEXT,
    "pdfBlobUrl" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "legalAcceptedAt" TIMESTAMP(3),
    "pdfSizeBytes" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProReportDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisSnapshot" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'upload',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProReportDelivery_stripeSessionId_key" ON "ProReportDelivery"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisSnapshot_deliveryId_key" ON "AnalysisSnapshot"("deliveryId");

-- AddForeignKey
ALTER TABLE "AnalysisSnapshot" ADD CONSTRAINT "AnalysisSnapshot_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "ProReportDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
