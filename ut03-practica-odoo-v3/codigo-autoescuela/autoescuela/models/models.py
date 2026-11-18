# -*- coding: utf-8 -*-

from dateutil.relativedelta import relativedelta

from odoo import api, fields, models, _

# Texto de ayuda del campo carnet (valores recomendados, según el esquema E-R)
AYUDA_CARNET = (
    "AM = Ciclomotores (hasta 50 cc), "
    "A1 = Motocicletas (potencia máxima 11 kW), "
    "A2 = Motocicletas (potencia máxima 35 kW), "
    "A = Motocicletas y triciclos de motor, "
    "B = Automóviles (MMA hasta 3.500 kg)"
)

# Nombre explícito de la tabla intermedia Autoescuela <-> Examen.
# Las dos Many2many la comparten para que sean una la inversa de la otra.
TABLA_AUTOESCUELA_EXAMEN = 'autoescuela_autoescuela_examen_rel'


class Autoescuela(models.Model):
    _name = 'autoescuela.autoescuela'
    _description = 'Permite definir las características de una autoescuela'
    _order = 'name'

    name = fields.Char(string='Nombre de la autoescuela', required=True)
    domicilio = fields.Char(string='Domicilio')
    localidad = fields.Char(string='Localidad')
    provincia = fields.Char(string='Provincia')
    contacto = fields.Char(string='Contacto', help='Teléfono de contacto de la autoescuela')

    examen_ids = fields.Many2many(
        'autoescuela.examen',
        relation=TABLA_AUTOESCUELA_EXAMEN,
        column1='autoescuela_id',
        column2='examen_id',
        string='Exámenes',
    )
    profesor_ids = fields.One2many('autoescuela.profesor', 'autoescuela_id',
                                   string='Profesores asignados')
    alumno_ids = fields.One2many('autoescuela.alumno', 'autoescuela_id',
                                 string='Alumnos matriculados')


class Profesor(models.Model):
    _name = 'autoescuela.profesor'
    _description = 'Permite definir las características de un profesor de autoescuela'
    _order = 'name'

    name = fields.Char(string='Nombre del profesor', required=True)
    dni = fields.Char(string='DNI del profesor', required=True)
    coche = fields.Char(string='Coche del profesor')
    matricula = fields.Char(string='Matrícula del coche')
    autoescuela_id = fields.Many2one('autoescuela.autoescuela', string='Autoescuela asignada')
    incorporacion = fields.Date(string='Fecha de incorporación',
                                help='Fecha en la que el profesor empezó a trabajar en la autoescuela')
    antiguedad = fields.Integer(string='Antigüedad', compute='_compute_antiguedad',
                                help='Años completos desde la fecha de incorporación (campo calculado)')
    alumno_ids = fields.One2many('autoescuela.alumno', 'profesor_id', string='Alumnos del profesor')

    _sql_constraints = [
        ('dni_profesor_unico', 'UNIQUE(dni)', 'Ya existe un profesor con ese DNI.'),
    ]

    @api.depends('incorporacion')
    def _compute_antiguedad(self):
        hoy = fields.Date.context_today(self)
        for profesor in self:
            if profesor.incorporacion:
                profesor.antiguedad = relativedelta(hoy, profesor.incorporacion).years
            else:
                profesor.antiguedad = 0


class Alumno(models.Model):
    _name = 'autoescuela.alumno'
    _description = 'Permite definir las características de un alumno'
    _order = 'name'

    name = fields.Char(string='Nombre del alumno', required=True)
    dni = fields.Char(string='DNI del alumno', required=True)
    autoescuela_id = fields.Many2one('autoescuela.autoescuela', string='Autoescuela')
    profesor_id = fields.Many2one('autoescuela.profesor', string='Profesor habitual')
    examen_ids = fields.One2many('autoescuela.examen', 'alumno_id', string='Exámenes')
    domicilio = fields.Char(string='Domicilio')
    matricula = fields.Char(string='Número de matrícula',
                            help='Número de matrícula del alumno en la autoescuela')

    _sql_constraints = [
        ('matricula_alumno_unica', 'UNIQUE(matricula)', 'Ya existe un alumno con ese número de matrícula.'),
    ]


class Examen(models.Model):
    _name = 'autoescuela.examen'
    _description = 'Permite definir las características de un examen de conducir realizado o pendiente de realizar'
    # mail.thread: necesario para que tracking=True guarde el historial de cambios
    _inherit = ['mail.thread']
    _order = 'fecha desc, name desc'

    # campo autoincrementado por una secuencia definida en 'data/autoescuela_sequence.xml'
    name = fields.Char(string='Código del Examen', default=lambda self: _('Autogenerado'),
                       copy=False, readonly=True, tracking=True)
    fecha = fields.Date(string='Fecha del Examen')
    autoescuela_ids = fields.Many2many(
        'autoescuela.autoescuela',
        relation=TABLA_AUTOESCUELA_EXAMEN,
        column1='examen_id',
        column2='autoescuela_id',
        string='Autoescuelas Asociadas',
    )
    alumno_id = fields.Many2one('autoescuela.alumno', string='Alumno a Examinar o Ya Examinado',
                                required=True, ondelete='cascade')
    moneda_id = fields.Many2one('res.currency', string='Moneda',
                                default=lambda self: self.env.ref('base.EUR'))
    precio = fields.Monetary(string='Precio del Examen', currency_field='moneda_id')
    clases = fields.Integer(string='Número de clases')
    carnet = fields.Char(string='Tipo de Carnet', required=True, help=AYUDA_CARNET)
    aprobado = fields.Boolean(string='Aprobado')

    # se incluye la funcionalidad para generar la secuencia para el código de examen
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('Autogenerado')) == _('Autogenerado'):
                vals['name'] = self.env['ir.sequence'].next_by_code('autoescuela.examen')
        return super().create(vals_list)

    # Texto que se ve en el calendario, las migas de pan y las etiquetas.
    # En Odoo 17 name_get() está obsoleto: se sobrescribe _compute_display_name.
    @api.depends('name', 'carnet')
    def _compute_display_name(self):
        for examen in self:
            examen.display_name = 'Código Examen: %s - Carnet: %s' % (examen.name, examen.carnet)
