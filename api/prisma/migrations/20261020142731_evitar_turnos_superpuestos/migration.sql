-- Necesaria para combinar "igual a" (=) con "se superpone" (&&) en la misma regla
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Un profesional no puede tener dos turnos no cancelados que se superpongan
ALTER TABLE "turnos"
  ADD CONSTRAINT "turnos_sin_superposicion"
  EXCLUDE USING gist (
    "profesional_id" WITH =,
    tstzrange("inicio", "fin") WITH &&
  )
  WHERE ("estado" <> 'cancelado');