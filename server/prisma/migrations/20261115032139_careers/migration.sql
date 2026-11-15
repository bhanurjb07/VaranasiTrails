-- CreateTable
CREATE TABLE "job_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "workMode" TEXT NOT NULL DEFAULT 'ONSITE',
    "experience" TEXT,
    "salary" TEXT,
    "aboutRole" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL DEFAULT '',
    "requirements" TEXT NOT NULL,
    "applyUrl" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "closesAt" DATETIME,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "job_listings_isPublished_department_idx" ON "job_listings"("isPublished", "department");
