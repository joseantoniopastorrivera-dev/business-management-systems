-- Práctica 3 Odoo (Autoescuela Complutum) - Ejercicio 12: restricciones SQL
-- Comprueba en PostgreSQL (base de datos test) que Odoo ha creado las restricciones
-- UNIQUE definidas en _sql_constraints de los modelos Profesor y Alumno.
-- Se ejecuta en pgAdmin > Query Tool (Alt+Shift+Q) conectado a test/odoo@Odoo Ubuntu - odoo.
--
-- pg_constraint es el catálogo del sistema donde PostgreSQL guarda todas las restricciones.
--   conrelid::regclass      -> nombre de la tabla a la que pertenece la restricción
--   conname                 -> nombre de la restricción (tabla + nombre puesto en _sql_constraints)
--   pg_get_constraintdef()  -> definición legible, por ejemplo UNIQUE (dni)
--   contype                 -> tipo: 'u' = UNIQUE, 'p' = PRIMARY KEY, 'f' = FOREIGN KEY

-- 1) Primera comprobación: todas las restricciones de las dos tablas (11 filas,
--    incluidas las claves ajenas create_uid, write_uid, autoescuela_id, profesor_id...)
SELECT conrelid::regclass AS tabla, conname AS restriccion, contype AS tipo,
       pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid IN ('autoescuela_alumno'::regclass, 'autoescuela_profesor'::regclass)
ORDER BY 1, 2;

-- 2) Consulta filtrada que aparece en la captura 094: solo UNIQUE y PRIMARY KEY (4 filas)
SELECT conrelid::regclass AS tabla, conname AS restriccion,
       pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid IN ('autoescuela_alumno'::regclass, 'autoescuela_profesor'::regclass)
  AND contype IN ('u', 'p')
ORDER BY 1, 2;

-- Resultado obtenido (18/11/2026):
--  autoescuela_profesor | autoescuela_profesor_dni_profesor_unico   | UNIQUE (dni)
--  autoescuela_profesor | autoescuela_profesor_pkey                 | PRIMARY KEY (id)
--  autoescuela_alumno   | autoescuela_alumno_matricula_alumno_unica | UNIQUE (matricula)
--  autoescuela_alumno   | autoescuela_alumno_pkey                   | PRIMARY KEY (id)
