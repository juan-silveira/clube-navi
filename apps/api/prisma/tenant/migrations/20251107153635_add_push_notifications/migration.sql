-- CreateEnum
CREATE TYPE "PushCampaignStatus" AS ENUM ('draft', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "PushNotificationStatus" AS ENUM ('pending', 'sent', 'failed', 'read');

-- CreateTable
CREATE TABLE "push_notification_campaigns" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "page_title" VARCHAR(100),
    "page_description" TEXT,
    "code" VARCHAR(50),
    "rules" TEXT,
    "logo_url" VARCHAR(255),
    "banner_url" VARCHAR(255),
    "enable_button" BOOLEAN NOT NULL DEFAULT false,
    "button_type" VARCHAR(20),
    "target_module" VARCHAR(50),
    "external_link" VARCHAR(500),
    "button_text" VARCHAR(50),
    "geolocation" JSONB,
    "target_user_count" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "status" "PushCampaignStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),

    CONSTRAINT "push_notification_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_notification_logs" (
    "id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "push_token" VARCHAR(500) NOT NULL,
    "status" "PushNotificationStatus" NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "sent_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "push_notification_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "push_notification_logs" ADD CONSTRAINT "push_notification_logs_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "push_notification_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_notification_logs" ADD CONSTRAINT "push_notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
