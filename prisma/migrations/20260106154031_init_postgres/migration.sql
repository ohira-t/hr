-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "segment" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientNameKana" TEXT NOT NULL DEFAULT '',
    "clientId" TEXT NOT NULL DEFAULT '',
    "applicationId" TEXT NOT NULL DEFAULT '',
    "prefecture" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "facilityName" TEXT NOT NULL DEFAULT '',
    "position" TEXT NOT NULL DEFAULT 'サビ管',
    "employmentType" TEXT NOT NULL DEFAULT '正社員',
    "targetHiringCount" INTEGER NOT NULL DEFAULT 1,
    "currentHiringCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT '採用活動中',
    "assignee" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '推進部',
    "handoverDate" TIMESTAMP(3),
    "deadlineDate" TIMESTAMP(3),
    "openingDate" TEXT,
    "hurdles" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "nextAction" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaManagement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '未掲載',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Assignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_hrId_key" ON "Project"("hrId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaManagement_projectId_mediaName_key" ON "MediaManagement"("projectId", "mediaName");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_name_key" ON "Assignee"("name");

-- AddForeignKey
ALTER TABLE "MediaManagement" ADD CONSTRAINT "MediaManagement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
