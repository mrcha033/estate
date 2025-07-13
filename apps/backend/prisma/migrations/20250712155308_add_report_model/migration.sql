-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "model_hash" TEXT NOT NULL,
    "prompt_hash" TEXT NOT NULL,
    "s3_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
