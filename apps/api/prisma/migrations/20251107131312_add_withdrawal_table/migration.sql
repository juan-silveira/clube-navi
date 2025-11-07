-- CreateEnum
CREATE TYPE "Network" AS ENUM ('mainnet', 'testnet');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('transfer', 'contract_deploy', 'contract_call', 'contract_read', 'deposit', 'withdraw', 'stake', 'unstake', 'exchange', 'stake_reward');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('BASIC', 'PRO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "UserDocumentType" AS ENUM ('front', 'back', 'selfie');

-- CreateEnum
CREATE TYPE "UserDocumentStatus" AS ENUM ('not_sent', 'pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "TwoFactorType" AS ENUM ('totp', 'sms', 'email', 'backup_codes');

-- CreateEnum
CREATE TYPE "UserActionType" AS ENUM ('login', 'logout', 'login_failed', 'password_reset', 'password_changed', 'two_factor_enabled', 'two_factor_disabled', 'two_factor_verified', 'profile_updated', 'profile_viewed', 'document_uploaded', 'document_verified', 'deposit_initiated', 'deposit_confirmed', 'deposit_failed', 'withdrawal_initiated', 'withdrawal_approved', 'withdrawal_completed', 'withdrawal_failed', 'transfer_sent', 'transfer_received', 'transfer_failed', 'transaction_sent', 'transaction_confirmed', 'transaction_failed', 'contract_interaction', 'token_swap', 'stake_created', 'stake_withdrawn', 'reward_claimed', 'api_key_created', 'api_key_deleted', 'suspicious_activity', 'account_locked', 'account_unlocked', 'notification_sent', 'email_sent', 'webhook_triggered', 'cache_cleared', 'user_created', 'user_updated', 'user_deleted', 'permission_granted', 'permission_revoked', 'distributeReward', 'registration_completed');

-- CreateEnum
CREATE TYPE "UserActionCategory" AS ENUM ('authentication', 'profile', 'financial', 'blockchain', 'security', 'system', 'admin');

-- CreateEnum
CREATE TYPE "UserActionStatus" AS ENUM ('success', 'failed', 'pending', 'cancelled');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('pending', 'processing', 'completed', 'rejected', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "phone" VARCHAR(20),
    "birth_date" DATE,
    "public_key" TEXT,
    "private_key" TEXT,
    "password" VARCHAR(255) NOT NULL,
    "password_changed_at" TIMESTAMPTZ(6),
    "session_token" VARCHAR(255),
    "session_expires_at" TIMESTAMPTZ(6),
    "session_timeout" INTEGER NOT NULL DEFAULT 600,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "profile_picture" TEXT,
    "metadata" JSONB,
    "last_activity_at" TIMESTAMPTZ(6),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_failed_login_at" TIMESTAMPTZ(6),
    "is_blocked_login_attempts" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "user_plan" "UserPlan" NOT NULL DEFAULT 'BASIC',
    "back_document" "UserDocumentStatus" DEFAULT 'not_sent',
    "front_document" "UserDocumentStatus" DEFAULT 'not_sent',
    "selfie_document" "UserDocumentStatus" DEFAULT 'not_sent',
    "referral_id" VARCHAR(50),
    "referral_description" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "transaction_type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(20,8),
    "currency" VARCHAR(5),
    "tx_hash" VARCHAR(66),
    "block_number" BIGINT,
    "from_address" VARCHAR(42),
    "to_address" VARCHAR(42),
    "confirmed_at" TIMESTAMPTZ(6),
    "failed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "metadata" JSONB,
    "fee" DECIMAL(15,2) DEFAULT 0,
    "net_amount" DECIMAL(20,8),
    "operation_type" VARCHAR(50),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "filename" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" BIGINT NOT NULL,
    "category" VARCHAR(100),
    "tags" JSON,
    "metadata" JSONB,
    "path" VARCHAR(500) NOT NULL,
    "url" VARCHAR(500),
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ(6),
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "last_download_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "document_type" "UserDocumentType" NOT NULL,
    "status" "UserDocumentStatus" NOT NULL DEFAULT 'not_sent',
    "s3_url" VARCHAR(500),
    "s3_key" VARCHAR(500),
    "filename" VARCHAR(255),
    "mime_type" VARCHAR(100),
    "file_size" BIGINT,
    "rejection_reason" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ(6),
    "uploaded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_two_factors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "TwoFactorType" NOT NULL,
    "secret" TEXT,
    "phone_number" VARCHAR(20),
    "email" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "backup_codes" JSONB,
    "used_backup_codes" JSONB NOT NULL DEFAULT '[]',
    "setup_completed_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(6),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "user_two_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "sender" VARCHAR(50) NOT NULL DEFAULT 'coinage',
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "read_date" TIMESTAMPTZ(6),
    "delete_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "user_id" UUID NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_actions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" "UserActionType" NOT NULL,
    "category" "UserActionCategory" NOT NULL,
    "status" "UserActionStatus" NOT NULL DEFAULT 'success',
    "details" JSONB,
    "metadata" JSONB,
    "related_id" UUID,
    "related_type" VARCHAR(50),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "device_info" JSONB,
    "location" JSONB,
    "error_message" TEXT,
    "error_code" VARCHAR(50),
    "duration" INTEGER,
    "performed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_taxes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "exchange_fee_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "transfer_fee_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "gas_subsidy_enabled" BOOLEAN NOT NULL DEFAULT false,
    "gas_subsidy_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custom_fees" JSONB,
    "is_vip" BOOLEAN NOT NULL DEFAULT false,
    "vip_level" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deposit_fee" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "withdraw_fee" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "pix_validation" DOUBLE PRECISION DEFAULT 1.0,
    "token_transfer_fees" JSONB DEFAULT '{"DREX": 1.0, "cBRL": 0.5}',

    CONSTRAINT "user_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_balances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "balances" JSONB NOT NULL DEFAULT '{}',
    "stakes" JSONB NOT NULL DEFAULT '{}',
    "token_data" JSONB,
    "network" "Network" NOT NULL DEFAULT 'testnet',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "pix_key" VARCHAR(255) NOT NULL,
    "pix_key_type" VARCHAR(20) NOT NULL,
    "pix_key_owner_name" VARCHAR(255),
    "pix_key_owner_cpf" VARCHAR(14),
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'pending',
    "rejection_reason" TEXT,
    "processed_by" UUID,
    "processed_at" TIMESTAMPTZ(6),
    "tx_hash" VARCHAR(255),
    "fee" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_configs" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "user_ids" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notification_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "id" UUID NOT NULL,
    "sender_user_id" UUID NOT NULL,
    "recipient_user_ids" JSONB NOT NULL,
    "recipient_phones" JSONB NOT NULL,
    "message" TEXT NOT NULL,
    "template_id" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" UUID NOT NULL,
    "template_id" VARCHAR(100),
    "from_email" VARCHAR(255) NOT NULL,
    "from_name" VARCHAR(255),
    "to_email" VARCHAR(255) NOT NULL,
    "to_name" VARCHAR(255),
    "subject" VARCHAR(500) NOT NULL,
    "html_content" TEXT,
    "text_content" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "provider" VARCHAR(50),
    "provider_id" VARCHAR(255),
    "metadata" JSONB,
    "error" TEXT,
    "sent_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "opened_at" TIMESTAMPTZ(6),
    "clicked_at" TIMESTAMPTZ(6),
    "bounced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_session_token_key" ON "users"("session_token");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_cpf" ON "users"("cpf");

-- CreateIndex
CREATE INDEX "idx_users_active" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "idx_users_email_confirmed" ON "users"("email_confirmed");

-- CreateIndex
CREATE INDEX "idx_users_last_activity" ON "users"("last_activity_at");

-- CreateIndex
CREATE INDEX "idx_users_user_plan" ON "users"("user_plan");

-- CreateIndex
CREATE INDEX "idx_users_referral_id" ON "users"("referral_id");

-- CreateIndex
CREATE INDEX "idx_users_username" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_transactions_user_type" ON "transactions"("user_id", "transaction_type");

-- CreateIndex
CREATE INDEX "idx_transactions_type_status" ON "transactions"("transaction_type", "status");

-- CreateIndex
CREATE INDEX "idx_transactions_tx_hash" ON "transactions"("tx_hash");

-- CreateIndex
CREATE INDEX "idx_transactions_created_at" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "idx_documents_user_id" ON "documents"("user_id");

-- CreateIndex
CREATE INDEX "idx_documents_category" ON "documents"("category");

-- CreateIndex
CREATE INDEX "idx_documents_expires_at" ON "documents"("expires_at");

-- CreateIndex
CREATE INDEX "idx_user_documents_user_id" ON "user_documents"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_documents_status" ON "user_documents"("status");

-- CreateIndex
CREATE INDEX "idx_user_documents_type" ON "user_documents"("document_type");

-- CreateIndex
CREATE INDEX "idx_user_documents_reviewer" ON "user_documents"("reviewed_by");

-- CreateIndex
CREATE INDEX "idx_user_documents_status_type" ON "user_documents"("status", "document_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_documents_user_id_document_type_key" ON "user_documents"("user_id", "document_type");

-- CreateIndex
CREATE INDEX "idx_user_two_factors_user_id" ON "user_two_factors"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_two_factors_user_active" ON "user_two_factors"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_two_factors_user_id_type_key" ON "user_two_factors"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_name_key" ON "email_templates"("name");

-- CreateIndex
CREATE INDEX "idx_email_templates_name" ON "email_templates"("name");

-- CreateIndex
CREATE INDEX "idx_email_templates_active" ON "email_templates"("is_active");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_active" ON "notifications"("is_active");

-- CreateIndex
CREATE INDEX "idx_notifications_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_favorite" ON "notifications"("is_favorite");

-- CreateIndex
CREATE INDEX "idx_notifications_created" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "idx_user_actions_user_id" ON "user_actions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_actions_action" ON "user_actions"("action");

-- CreateIndex
CREATE INDEX "idx_user_actions_category" ON "user_actions"("category");

-- CreateIndex
CREATE INDEX "idx_user_actions_status" ON "user_actions"("status");

-- CreateIndex
CREATE INDEX "idx_user_actions_performed_at" ON "user_actions"("performed_at");

-- CreateIndex
CREATE INDEX "idx_user_actions_related_id" ON "user_actions"("related_id");

-- CreateIndex
CREATE INDEX "idx_user_actions_user_performed" ON "user_actions"("user_id", "performed_at");

-- CreateIndex
CREATE INDEX "idx_user_actions_user_category" ON "user_actions"("user_id", "category");

-- CreateIndex
CREATE INDEX "idx_user_actions_user_action_status" ON "user_actions"("user_id", "action", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_taxes_user_id_key" ON "user_taxes"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_taxes_user_id" ON "user_taxes"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_taxes_is_vip" ON "user_taxes"("is_vip");

-- CreateIndex
CREATE INDEX "idx_user_taxes_vip_level" ON "user_taxes"("vip_level");

-- CreateIndex
CREATE UNIQUE INDEX "password_resets_token_key" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "idx_password_resets_user_id" ON "password_resets"("user_id");

-- CreateIndex
CREATE INDEX "idx_password_resets_token" ON "password_resets"("token");

-- CreateIndex
CREATE INDEX "idx_password_resets_expires" ON "password_resets"("expires_at");

-- CreateIndex
CREATE INDEX "idx_password_resets_email" ON "password_resets"("email");

-- CreateIndex
CREATE INDEX "idx_user_balances_user_id" ON "user_balances"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_balances_created_at" ON "user_balances"("created_at");

-- CreateIndex
CREATE INDEX "idx_user_balances_user_date" ON "user_balances"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_user_balances_network" ON "user_balances"("network");

-- CreateIndex
CREATE INDEX "idx_withdrawals_user_id" ON "withdrawals"("user_id");

-- CreateIndex
CREATE INDEX "idx_withdrawals_status" ON "withdrawals"("status");

-- CreateIndex
CREATE INDEX "idx_withdrawals_created_at" ON "withdrawals"("created_at");

-- CreateIndex
CREATE INDEX "idx_withdrawals_user_status" ON "withdrawals"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "notification_configs_type_key" ON "notification_configs"("type");

-- CreateIndex
CREATE INDEX "idx_notification_config_type" ON "notification_configs"("type");

-- CreateIndex
CREATE INDEX "idx_whatsapp_messages_sender" ON "whatsapp_messages"("sender_user_id");

-- CreateIndex
CREATE INDEX "idx_whatsapp_messages_sent_at" ON "whatsapp_messages"("sent_at");

-- CreateIndex
CREATE INDEX "idx_whatsapp_messages_template" ON "whatsapp_messages"("template_id");

-- CreateIndex
CREATE INDEX "idx_whatsapp_messages_status" ON "whatsapp_messages"("status");

-- CreateIndex
CREATE INDEX "idx_email_log_to_email" ON "email_logs"("to_email");

-- CreateIndex
CREATE INDEX "idx_email_log_status" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "idx_email_log_subject" ON "email_logs"("subject");

-- CreateIndex
CREATE INDEX "idx_email_log_created_at" ON "email_logs"("created_at");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_two_factors" ADD CONSTRAINT "user_two_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_actions" ADD CONSTRAINT "user_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_taxes" ADD CONSTRAINT "user_taxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_balances" ADD CONSTRAINT "user_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
