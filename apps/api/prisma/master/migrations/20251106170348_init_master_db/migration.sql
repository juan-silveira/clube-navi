-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('trial', 'active', 'suspended', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ModuleKey" AS ENUM ('marketplace', 'internet', 'cinema', 'telemedicine', 'giftcards', 'insurance', 'streaming', 'referrals', 'cashback', 'telecom');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'manager', 'support');

-- CreateTable
CREATE TABLE "clubs" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "company_document" VARCHAR(18) NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'trial',
    "database_host" VARCHAR(255) NOT NULL,
    "database_port" INTEGER NOT NULL DEFAULT 5432,
    "database_name" VARCHAR(100) NOT NULL,
    "database_user" VARCHAR(100) NOT NULL,
    "database_password" VARCHAR(255) NOT NULL,
    "subdomain" VARCHAR(50),
    "custom_domain" VARCHAR(255),
    "admin_subdomain" VARCHAR(50),
    "max_users" INTEGER NOT NULL DEFAULT 1000,
    "max_admins" INTEGER NOT NULL DEFAULT 10,
    "max_storage_gb" INTEGER NOT NULL DEFAULT 50,
    "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'BASIC',
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "monthly_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "trial_ends_at" TIMESTAMPTZ(6),
    "next_billing_date" TIMESTAMPTZ(6),
    "last_billing_date" TIMESTAMPTZ(6),
    "total_billed" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "outstanding_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "contact_name" VARCHAR(255) NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_brandings" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "logo_url" VARCHAR(500),
    "logo_icon_url" VARCHAR(500),
    "favicon_url" VARCHAR(500),
    "primary_color" VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    "secondary_color" VARCHAR(7) NOT NULL DEFAULT '#10B981',
    "accent_color" VARCHAR(7) NOT NULL DEFAULT '#F59E0B',
    "background_color" VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
    "text_color" VARCHAR(7) NOT NULL DEFAULT '#1F2937',
    "app_name" VARCHAR(100) NOT NULL,
    "app_description" TEXT,
    "app_store_url" VARCHAR(500),
    "play_store_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "club_brandings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_modules" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "module_key" "ModuleKey" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_enabled_by_default" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB DEFAULT '{}',
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "club_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_stats" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "total_users" INTEGER NOT NULL DEFAULT 0,
    "total_consumers" INTEGER NOT NULL DEFAULT 0,
    "total_merchants" INTEGER NOT NULL DEFAULT 0,
    "active_users_30d" INTEGER NOT NULL DEFAULT 0,
    "total_purchases" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_cashback_paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_platform_fees" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "revenue_30d" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "purchases_30d" INTEGER NOT NULL DEFAULT 0,
    "cashback_30d" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "club_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_stats" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_clubs" INTEGER NOT NULL DEFAULT 0,
    "total_users" INTEGER NOT NULL DEFAULT 0,
    "total_consumers" INTEGER NOT NULL DEFAULT 0,
    "total_merchants" INTEGER NOT NULL DEFAULT 0,
    "total_purchases" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_cashback_paid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_platform_fees" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "active_users_30d" INTEGER NOT NULL DEFAULT 0,
    "revenue_30d" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "purchases_30d" INTEGER NOT NULL DEFAULT 0,
    "cashback_30d" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "new_clubs" INTEGER NOT NULL DEFAULT 0,
    "new_users" INTEGER NOT NULL DEFAULT 0,
    "churned_clubs" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_cashback_configs" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "consumer_percent" DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    "club_percent" DECIMAL(5,2) NOT NULL DEFAULT 25.0,
    "consumer_referrer_percent" DECIMAL(5,2) NOT NULL DEFAULT 12.5,
    "merchant_referrer_percent" DECIMAL(5,2) NOT NULL DEFAULT 12.5,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "club_cashback_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_withdrawal_configs" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "withdrawal_fee_percent" DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    "withdrawal_fee_fixed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "min_withdrawal_amount" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "club_withdrawal_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_admins" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "club_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_api_keys" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "key_name" VARCHAR(100) NOT NULL,
    "api_key" VARCHAR(64) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "club_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_usage_stats" (
    "id" UUID NOT NULL,
    "club_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "api_calls" INTEGER NOT NULL DEFAULT 0,
    "storage_used_mb" INTEGER NOT NULL DEFAULT 0,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_usage_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clubs_slug_key" ON "clubs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_company_document_key" ON "clubs"("company_document");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_subdomain_key" ON "clubs"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_custom_domain_key" ON "clubs"("custom_domain");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_admin_subdomain_key" ON "clubs"("admin_subdomain");

-- CreateIndex
CREATE INDEX "clubs_slug_idx" ON "clubs"("slug");

-- CreateIndex
CREATE INDEX "clubs_subdomain_idx" ON "clubs"("subdomain");

-- CreateIndex
CREATE INDEX "clubs_status_idx" ON "clubs"("status");

-- CreateIndex
CREATE INDEX "idx_clubs_subscription_status" ON "clubs"("subscription_status");

-- CreateIndex
CREATE UNIQUE INDEX "club_brandings_club_id_key" ON "club_brandings"("club_id");

-- CreateIndex
CREATE INDEX "club_modules_club_id_idx" ON "club_modules"("club_id");

-- CreateIndex
CREATE INDEX "club_modules_is_enabled_idx" ON "club_modules"("is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "club_modules_club_id_module_key_key" ON "club_modules"("club_id", "module_key");

-- CreateIndex
CREATE UNIQUE INDEX "club_stats_club_id_key" ON "club_stats"("club_id");

-- CreateIndex
CREATE INDEX "club_stats_club_id_idx" ON "club_stats"("club_id");

-- CreateIndex
CREATE UNIQUE INDEX "global_stats_date_key" ON "global_stats"("date");

-- CreateIndex
CREATE INDEX "global_stats_date_idx" ON "global_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "club_cashback_configs_club_id_key" ON "club_cashback_configs"("club_id");

-- CreateIndex
CREATE UNIQUE INDEX "club_withdrawal_configs_club_id_key" ON "club_withdrawal_configs"("club_id");

-- CreateIndex
CREATE INDEX "club_admins_club_id_idx" ON "club_admins"("club_id");

-- CreateIndex
CREATE INDEX "club_admins_email_idx" ON "club_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "club_admins_club_id_email_key" ON "club_admins"("club_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "club_api_keys_api_key_key" ON "club_api_keys"("api_key");

-- CreateIndex
CREATE INDEX "club_api_keys_club_id_idx" ON "club_api_keys"("club_id");

-- CreateIndex
CREATE INDEX "club_api_keys_api_key_idx" ON "club_api_keys"("api_key");

-- CreateIndex
CREATE INDEX "club_usage_stats_club_id_idx" ON "club_usage_stats"("club_id");

-- CreateIndex
CREATE INDEX "club_usage_stats_date_idx" ON "club_usage_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "club_usage_stats_club_id_date_key" ON "club_usage_stats"("club_id", "date");

-- AddForeignKey
ALTER TABLE "club_brandings" ADD CONSTRAINT "club_brandings_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_modules" ADD CONSTRAINT "club_modules_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_stats" ADD CONSTRAINT "club_stats_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_cashback_configs" ADD CONSTRAINT "club_cashback_configs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_withdrawal_configs" ADD CONSTRAINT "club_withdrawal_configs_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_admins" ADD CONSTRAINT "club_admins_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_api_keys" ADD CONSTRAINT "club_api_keys_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_usage_stats" ADD CONSTRAINT "club_usage_stats_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
