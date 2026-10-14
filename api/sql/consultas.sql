-- Todas las columnas de todos los profesionales
SELECT * FROM profesionales;

-- Todas las columnas de todos los clientes
SELECT * FROM clientes;

-- Todas las columnas de todos los turnos
SELECT * FROM turnos;

-- Todas las columnas de todos los horarios disponibles
SELECT * FROM horarios_disponibles;

-- Solo algunas columnas, filtradas y ordenadas
SELECT nombre, email FROM profesionales
WHERE especialidad = 'Kinesiología'
ORDER BY nombre;

-- filtrar por fecha de mañana
SELECT * FROM turnos
WHERE inicio >= date_trunc('day', now()) + interval '1 day'
AND inicio <  date_trunc('day', now()) + interval '2 days'
ORDER BY inicio;

-- JOIN: cada turno con el nombre del profesional y del cliente
SELECT t.inicio, t.estado, p.nombre AS profesional, c.nombre AS cliente
FROM turnos t
JOIN profesionales p ON p.id = t.profesional_id
JOIN clientes c ON c.id = t.cliente_id
ORDER BY t.inicio;

-- Agrupar: cuántos turnos tiene cada profesional
SELECT p.nombre, COUNT(*) AS cantidad
FROM turnos t
JOIN profesionales p ON p.id = t.profesional_id
GROUP BY p.nombre;

-- Agrupar: profesionales sin turnos

SELECT p.nombre, COUNT(t.id) AS cantidad
FROM profesionales p
LEFT JOIN turnos t ON p.id = t.profesional_id
GROUP BY p.id
HAVING COUNT(t.id) = 0;

-- actualizar: cambiar los datos de un profesional

UPDATE profesionales SET especialidad = 'Kinesiología Deportiva'
WHERE email = 'laura@turnero.com';

--actualizar: cambiar los datos de un cliente

UPDATE clientes SET email = 'no-existe@mail.com'
WHERE nombre = 'Carlos Méndez';

-- eliminar: borrar un cliente que no existe (no debería afectar a la base de datos)

DELETE FROM clientes WHERE email = 'no-existe@mail.com';