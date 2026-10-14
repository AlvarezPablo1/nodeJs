-- Email duplicado
INSERT INTO profesionales (nombre, especialidad, email)
VALUES ('Otra Laura', 'Kinesiología', 'laura@turnero.com');

-- Turno para un profesional que no existe
INSERT INTO turnos (profesional_id, cliente_id, inicio, fin)
VALUES ('99999999-9999-4999-8999-999999999999', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', now(), now() + interval '30 minutes');

-- Turno que termina antes de empezar
INSERT INTO turnos (profesional_id, cliente_id, inicio, fin)
VALUES ('33333333-3333-4333-8333-333333333333', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', now(), now() - interval '1 hour');

-- Estado inválido
UPDATE turnos SET estado = 'perdido' WHERE estado = 'completado';

-- Borrar un profesional con turnos
DELETE FROM profesionales WHERE email = 'laura@turnero.com';