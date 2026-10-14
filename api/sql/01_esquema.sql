DROP TABLE IF EXISTS horarios_disponibles;
DROP TABLE IF EXISTS turnos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS profesionales;

CREATE TABLE profesionales (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL,
  especialidad text NOT NULL,
  email        text NOT NULL UNIQUE,
  creado_en    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clientes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre    text NOT NULL,
  email     text NOT NULL UNIQUE,
  telefono  text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE turnos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id uuid NOT NULL REFERENCES profesionales(id) ON DELETE NO ACTION,
  cliente_id     uuid NOT NULL REFERENCES clientes(id) ON DELETE NO ACTION,
  inicio         timestamptz NOT NULL,
  fin            timestamptz NOT NULL,
  estado         text NOT NULL DEFAULT 'confirmado'
                 CHECK (estado IN ('confirmado', 'cancelado', 'completado')),
  creado_en      timestamptz NOT NULL DEFAULT now(),
  CHECK (fin > inicio)
);

CREATE TABLE horarios_disponibles (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profesional_id uuid NOT NULL REFERENCES profesionales(id) ON DELETE NO ACTION,
  dia_semana     smallint NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  inicio         time NOT NULL,
  fin            time NOT NULL,
  CHECK (fin > inicio),
  UNIQUE (profesional_id, dia_semana, inicio)
);
