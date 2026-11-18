# -*- coding: utf-8 -*-
{
    'name': "Autoescuela",

    'summary': "Gestión de autoescuelas: profesores, alumnos y exámenes",

    'description': """
Aplicación para gestionar una red de autoescuelas (Autoescuela Complutum):
autoescuelas, profesores con su antigüedad, alumnos matriculados y exámenes
con código autogenerado, perfiles de seguridad Gestor y Director e informes.
    """,

    'author': "José Antonio Pastor Rivera",
    'website': "https://github.com/joseantoniopastorrivera-dev/autoescuela",

    # Categoría y versión (la versión se sube con cada funcionalidad nueva)
    'category': 'Services',
    'version': '17.0.1.0.0',
    'license': 'LGPL-3',

    # mail: el modelo Examen hereda mail.thread para que tracking=True funcione
    'depends': ['base', 'mail'],

    # Orden importante: grupos -> permisos -> datos -> vistas (con sus acciones)
    # -> menús (usan las acciones) -> informes
    'data': [
        'security/autoescuela_security.xml',
        'security/ir.model.access.csv',
        'data/autoescuela_sequence.xml',
        'views/autoescuela_autoescuela_view.xml',
        'views/autoescuela_profesor_view.xml',
        'views/autoescuela_alumno_view.xml',
        'views/autoescuela_examen_view.xml',
        'views/autoescuela_menus.xml',
        'reports/autoescuela_autoescuela_report.xml',
        'reports/autoescuela_profesor_report.xml',
        'reports/autoescuela_alumno_report.xml',
        'reports/autoescuela_examen_report.xml',
    ],

    # Tipo aplicación: sale en el filtro «Aplicaciones» con su icono
    'application': True,
    'installable': True,
}
