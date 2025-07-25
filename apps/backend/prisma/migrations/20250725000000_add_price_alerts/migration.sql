-- CreateTable
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "district_name" TEXT,
    "apartment_name" TEXT,
    "price_threshold" BIGINT,
    "threshold_type" TEXT NOT NULL,
    "change_percent" DOUBLE PRECISION,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_alerts_email_active_idx" ON "price_alerts"("email", "active");

-- CreateIndex
CREATE INDEX "price_alerts_active_idx" ON "price_alerts"("active");