INSERT INTO profesionales (id, nombre, especialidad, email) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Laura Gómez', 'Kinesiología', 'laura@turnero.com'),
  ('22222222-2222-4222-8222-222222222222', 'Martín Ruiz', 'Nutrición', 'martin@turnero.com'),
  ('33333333-3333-4333-8333-333333333333', 'Sofía Pérez', 'Psicología', 'sofia@turnero.com');

INSERT INTO clientes (id, nombre, email, telefono) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Carlos Méndez', 'carlos@mail.com', '223-555-0101'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Lucía Fernández', 'lucia@mail.com', NULL);

INSERT INTO turnos (profesional_id, cliente_id, inicio, fin, estado) VALUES
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   date_trunc('day', now()) + interval '1 day 10 hours',
   date_trunc('day', now()) + interval '1 day 10 hours 45 minutes', 'confirmado'),

  ('11111111-1111-4111-8111-111111111111', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
   date_trunc('day', now()) + interval '1 day 11 hours',
   date_trunc('day', now()) + interval '1 day 11 hours 45 minutes', 'confirmado'),

  ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   date_trunc('day', now()) - interval '3 days' + interval '9 hours',
   date_trunc('day', now()) - interval '3 days' + interval '9 hours 30 minutes', 'completado');

INSERT INTO horarios_disponibles (profesional_id, dia_semana, inicio, fin) VALUES
  ('11111111-1111-4111-8111-111111111111', 0, '09:00', '12:00'),
  ('11111111-1111-4111-8111-111111111111', 2, '14:00', '18:00'),
  ('22222222-2222-4222-8222-222222222222', 1, '10:00', '13:00'),
  ('22222222-2222-4222-8222-222222222222', 3, '15:00', '19:00'),
  ('33333333-3333-4333-8333-333333333333', 4, '08:30', '12:30');