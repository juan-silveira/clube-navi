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
CREATE TABLE "tenants" (
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

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_brandings" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
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

    CONSTRAINT "tenant_brandings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_modules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "module_key" "ModuleKey" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_enabled_by_default" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB DEFAULT '{}',
    "display_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_stats" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
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

    CONSTRAINT "tenant_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "global_stats" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "total_tenants" INTEGER NOT NULL DEFAULT 0,
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
    "new_tenants" INTEGER NOT NULL DEFAULT 0,
    "new_users" INTEGER NOT NULL DEFAULT 0,
    "churned_tenants" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_cashback_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "consumer_percent" DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    "club_percent" DECIMAL(5,2) NOT NULL DEFAULT 25.0,
    "consumer_referrer_percent" DECIMAL(5,2) NOT NULL DEFAULT 12.5,
    "merchant_referrer_percent" DECIMAL(5,2) NOT NULL DEFAULT 12.5,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_cashback_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_withdrawal_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "withdrawal_fee_percent" DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    "withdrawal_fee_fixed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "min_withdrawal_amount" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_withdrawal_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_admins" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenant_admins_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "tenant_api_keys" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "key_name" VARCHAR(100) NOT NULL,
    "api_key" VARCHAR(64) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenant_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_usage_stats" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "api_calls" INTEGER NOT NULL DEFAULT 0,
    "storage_used_mb" INTEGER NOT NULL DEFAULT 0,
    "active_users" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_usage_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_company_document_key" ON "tenants"("company_document");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_custom_domain_key" ON "tenants"("custom_domain");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_admin_subdomain_key" ON "tenants"("admin_subdomain");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_subdomain_idx" ON "tenants"("subdomain");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "idx_tenants_subscription_status" ON "tenants"("subscription_status");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_brandings_tenant_id_key" ON "tenant_brandings"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_modules_tenant_id_idx" ON "tenant_modules"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_modules_is_enabled_idx" ON "tenant_modules"("is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_modules_tenant_id_module_key_key" ON "tenant_modules"("tenant_id", "module_key");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_stats_tenant_id_key" ON "tenant_stats"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_stats_tenant_id_idx" ON "tenant_stats"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "global_stats_date_key" ON "global_stats"("date");

-- CreateIndex
CREATE INDEX "global_stats_date_idx" ON "global_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_cashback_configs_tenant_id_key" ON "tenant_cashback_configs"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_withdrawal_configs_tenant_id_key" ON "tenant_withdrawal_configs"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_admins_tenant_id_idx" ON "tenant_admins"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_admins_email_idx" ON "tenant_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_admins_tenant_id_email_key" ON "tenant_admins"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_api_keys_api_key_key" ON "tenant_api_keys"("api_key");

-- CreateIndex
CREATE INDEX "tenant_api_keys_tenant_id_idx" ON "tenant_api_keys"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_api_keys_api_key_idx" ON "tenant_api_keys"("api_key");

-- CreateIndex
CREATE INDEX "tenant_usage_stats_tenant_id_idx" ON "tenant_usage_stats"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_usage_stats_date_idx" ON "tenant_usage_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_usage_stats_tenant_id_date_key" ON "tenant_usage_stats"("tenant_id", "date");

-- AddForeignKey
ALTER TABLE "tenant_brandings" ADD CONSTRAINT "tenant_brandings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_modules" ADD CONSTRAINT "tenant_modules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_stats" ADD CONSTRAINT "tenant_stats_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_cashback_configs" ADD CONSTRAINT "tenant_cashback_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_withdrawal_configs" ADD CONSTRAINT "tenant_withdrawal_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_admins" ADD CONSTRAINT "tenant_admins_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_api_keys" ADD CONSTRAINT "tenant_api_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_usage_stats" ADD CONSTRAINT "tenant_usage_stats_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
