/*
  Warnings:

  - A unique constraint covering the columns `[usuario_id]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuario_id]` on the table `profesionales` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "rol" AS ENUM ('admin', 'profesional', 'cliente');

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "usuario_id" UUID;

-- AlterTable
ALTER TABLE "profesionales" ADD COLUMN     "usuario_id" UUID;

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "rol" NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuario_id_key" ON "clientes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "profesionales_usuario_id_key" ON "profesionales"("usuario_id");

-- AddForeignKey
ALTER TABLE "profesionales" ADD CONSTRAINT "profesionales_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
