-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('admin', 'manager', 'user');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(150) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "user_type" "user_type" NOT NULL DEFAULT 'user',
    "phone_number" VARCHAR(20),
    "organization" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_staff" BOOLEAN NOT NULL DEFAULT false,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" SERIAL NOT NULL,
    "institution_code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "service_type" VARCHAR(100),
    "capacity" INTEGER,
    "current_headcount" INTEGER,
    "address" VARCHAR(255),
    "operating_hours" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_history" (
    "id" SERIAL NOT NULL,
    "institution_id" INTEGER NOT NULL,
    "recorded_date" DATE NOT NULL,
    "name" VARCHAR(255),
    "address" VARCHAR(255),
    "capacity" INTEGER,
    "current_headcount" INTEGER,

    CONSTRAINT "institution_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_institution_code_key" ON "institutions"("institution_code");

-- AddForeignKey
ALTER TABLE "institution_history" ADD CONSTRAINT "institution_history_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
