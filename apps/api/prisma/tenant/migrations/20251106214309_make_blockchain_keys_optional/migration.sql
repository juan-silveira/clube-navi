-- AlterTable
ALTER TABLE "users" ALTER COLUMN "public_key" DROP NOT NULL,
ALTER COLUMN "private_key" DROP NOT NULL;
