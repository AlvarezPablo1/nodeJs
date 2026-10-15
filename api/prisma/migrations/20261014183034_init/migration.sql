-- CreateEnum
CREATE TYPE "estado_turno" AS ENUM ('confirmado', 'cancelado', 'completado');

-- CreateTable
CREATE TABLE "profesionales" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesionales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profesional_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "inicio" TIMESTAMPTZ(6) NOT NULL,
    "fin" TIMESTAMPTZ(6) NOT NULL,
    "estado" "estado_turno" NOT NULL DEFAULT 'confirmado',
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_disponibles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profesional_id" UUID NOT NULL,
    "dia_semana" SMALLINT NOT NULL,
    "inicio" TIME(6) NOT NULL,
    "fin" TIME(6) NOT NULL,

    CONSTRAINT "horarios_disponibles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profesionales_email_key" ON "profesionales"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_disponibles_profesional_id_dia_semana_inicio_key" ON "horarios_disponibles"("profesional_id", "dia_semana", "inicio");

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesionales"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_disponibles" ADD CONSTRAINT "horarios_disponibles_profesional_id_fkey" FOREIGN KEY ("profesional_id") REFERENCES "profesionales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reglas que el schema de Prisma no puede expresar
ALTER TABLE "turnos" ADD CONSTRAINT "turnos_fin_mayor_que_inicio" CHECK ("fin" > "inicio");
ALTER TABLE "horarios_disponibles" ADD CONSTRAINT "horarios_fin_mayor_que_inicio" CHECK ("fin" > "inicio");
ALTER TABLE "horarios_disponibles" ADD CONSTRAINT "horarios_dia_semana_valido" CHECK ("dia_semana" BETWEEN 0 AND 6);