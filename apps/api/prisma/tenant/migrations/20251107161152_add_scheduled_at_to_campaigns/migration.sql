-- AlterEnum
ALTER TYPE "PushCampaignStatus" ADD VALUE 'scheduled';

-- AlterTable
ALTER TABLE "push_notification_campaigns" ADD COLUMN     "scheduled_at" TIMESTAMPTZ(6);
