# autoescuela

Módulo de Odoo 17 para gestionar la red de autoescuelas **Autoescuela Complutum** (Alcalá de Henares): autoescuelas, profesores, alumnos y exámenes de conducir.

## Modelos

| Modelo | Qué guarda | Relaciones |
|---|---|---|
| `autoescuela.autoescuela` | Nombre, domicilio, localidad, provincia y contacto | Exámenes (Many2many), profesores y alumnos (One2many) |
| `autoescuela.profesor` | Nombre, DNI (único), coche, matrícula, fecha de incorporación y antigüedad calculada | Autoescuela (Many2one), alumnos (One2many) |
| `autoescuela.alumno` | Nombre, DNI, domicilio y número de matrícula (único) | Autoescuela y profesor (Many2one), exámenes (One2many) |
| `autoescuela.examen` | Código autogenerado (SGE00001…), fecha, precio, moneda, clases, carnet y aprobado | Alumno (Many2one), autoescuelas (Many2many) |

## Funcionalidades

- Código de examen automático con la secuencia `autoescuela.examen` (prefijo `SGE`).
- Perfiles de seguridad **Gestor** y **Director** (el Director hereda los permisos del Gestor).
- Vistas form, tree y calendar; búsqueda agrupada por tipo de carnet.
- Informes en PDF de autoescuela, profesor, alumno y examen.
- Restricciones SQL: no se repite el DNI de un profesor ni la matrícula de un alumno.
- Etiquetas `many2many_tags` en los campos relacionales.

## Instalación

1. Copiar la carpeta `autoescuela` en la ruta de addons de Odoo 17.
2. Reiniciar el servicio: `sudo systemctl restart odoo`.
3. En Odoo: **Aplicaciones → Actualizar lista de aplicaciones**, buscar «autoescuela» e **Instalar**.
4. Para importar alumnos desde Excel (`.xlsx`) el servidor necesita `python3-openpyxl`.

## Ramas

- `main`: versión estable.
- `develop`: integración de las ramas de trabajo.
- `feature/dev` y `feature/tawnyswine`: una rama por miembro del equipo.
