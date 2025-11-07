-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('page_view', 'click', 'form_submit', 'purchase', 'search', 'notification_open', 'notification_click', 'video_play', 'video_complete', 'download', 'share', 'error', 'custom');

-- AlterTable
ALTER TABLE "push_notification_logs" ADD COLUMN     "clicked_at" TIMESTAMPTZ(6),
ADD COLUMN     "opened_at" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" UUID,
    "event_type" "AnalyticsEventType" NOT NULL,
    "event_name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(50),
    "page_path" VARCHAR(500),
    "page_title" VARCHAR(200),
    "referrer" VARCHAR(500),
    "metadata" JSONB,
    "platform" VARCHAR(50),
    "device_type" VARCHAR(50),
    "browser" VARCHAR(50),
    "os" VARCHAR(50),
    "ip_address" VARCHAR(45),
    "country" VARCHAR(2),
    "city" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_token" VARCHAR(255) NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),
    "duration" INTEGER DEFAULT 0,
    "platform" VARCHAR(50),
    "device_type" VARCHAR(50),
    "browser" VARCHAR(50),
    "os" VARCHAR(50),
    "ip_address" VARCHAR(45),
    "page_views" INTEGER NOT NULL DEFAULT 0,
    "interactions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events"("user_id");

-- CreateIndex
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events"("event_type");

-- CreateIndex
CREATE INDEX "analytics_events_event_name_idx" ON "analytics_events"("event_name");

-- CreateIndex
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events"("created_at");

-- CreateIndex
CREATE INDEX "analytics_events_session_id_idx" ON "analytics_events"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_session_token_idx" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_started_at_idx" ON "user_sessions"("started_at");

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
