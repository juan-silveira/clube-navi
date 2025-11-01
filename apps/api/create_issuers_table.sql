-- Script SQL para criar a tabela issuers
-- Execute este script diretamente no PostgreSQL se preferir

-- CreateTable
CREATE TABLE IF NOT EXISTS "issuers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "logo_url" TEXT,
    "logo_key" TEXT,
    "foundation_year" INTEGER,
    "website" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issuers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "issuers_is_active_idx" ON "issuers"("is_active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "issuers_name_idx" ON "issuers"("name");

-- Verificar se a tabela foi criada
SELECT 'Tabela issuers criada com sucesso!' as resultado
WHERE EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'issuers'
);
