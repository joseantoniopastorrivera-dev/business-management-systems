# -*- coding: utf-8 -*-
# Genera el pie de cada figura a partir del nombre de la captura (NNN-descripcion-con-guiones.png).
# Se corrigen tildes y nombres propios con un diccionario; los pies importantes se escriben a mano en PIES.
import os, re, sys
from functools import lru_cache

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from configuracion import ruta


@lru_cache(maxsize=None)
def slugs(capt=None):
    """{número: descripción} de cada captura. Se lee al usarse (no al importar) y de la carpeta de config.json."""
    capt = capt or ruta('capturas')
    return {int(f[:3]): f[4:-4] for f in os.listdir(capt) if f[:3].isdigit() and f.endswith('.png')}

# Frases (se aplican primero, de más larga a más corta)
FRASES = {
    'cerveceria artesana springfield': 'Cervecería artesana Springfield',
    'cerveceria springfield': 'Cervecería Springfield', 'la cerveceria': 'la cervecería',
    'taberna de moe': 'taberna de Moe', 'llamarada moe ipa': 'Llamarada Moe IPA',
    'springfield lager': 'Springfield Lager', 'springfield stout': 'Springfield Stout',
    'trigo de shelbyville': 'Trigo de Shelbyville', 'maltas del duero': 'Maltas del Duero',
    'lupulos de leon': 'Lúpulos de León', 'levaduras ibericas': 'Levaduras Ibéricas',
    'envases del henares': 'Envases Técnicos del Henares', 'bodegas valdecuevas': 'Bodegas Valdecuevas',
    'bodegas senorio del oja': 'Bodegas Señorío del Oja', 'senorio del oja': 'Señorío del Oja',
    'valdecuevas': 'Valdecuevas', 'ribera del duero': 'Ribera del Duero', 'rueda': 'Rueda', 'rioja': 'Rioja',
    'malta pale ale': 'Malta Pale Ale', 'malta pilsen': 'Malta Pilsen', 'malta caramelo': 'Malta Caramelo',
    'malta de trigo': 'Malta de trigo', 'malta tostada': 'Malta tostada', 'lupulo cascade': 'Lúpulo Cascade',
    'lupulo saaz': 'Lúpulo Saaz', 'lupulo fuggle': 'Lúpulo Fuggle', 'levadura us 05': 'Levadura US-05',
    'levadura w 34 70': 'Levadura W-34/70', 'levadura wb 06': 'Levadura WB-06', 'levadura s 04': 'Levadura S-04',
    'barril pet 30 l': 'Barril PET 30 L', 'lucia herrero': 'Lucía Herrero', 'daniel ortega': 'Daniel Ortega',
    'marta sanz': 'Marta Sanz', 'javier navarro': 'Javier Navarro', 'elena cabrera': 'Elena Cabrera',
    'pablo fuentes': 'Pablo Fuentes', 'sara vidal': 'Sara Vidal', 'my company': '«My Company»',
    'espana pymes 2008': 'España PyMEs (2008)', 'europe madrid': 'Europe/Madrid', 'europe berlin': 'Europe/Berlin',
    'iva 21': 'IVA del 21 %', 'la ta': '«La ta»', 'alcala de henares': 'Alcalá de Henares',
    'ano nuevo': 'Año Nuevo', 'home alumno': '/home/alumno', 'desde tmp': 'desde /tmp',
    'contabilidad community': 'contabilidad en Community', 'del pgc': 'del PGC', 'ajustes rrhh': 'ajustes de RR. HH.',
    '24 7': '24/7', '23 11': '23/11', '1 12': '1/12', '0 25 euros hora': '0,25 €/hora', '382 euros': '382 €',
    'saco 25 kg': 'saco de 25 kg', 'sobre 500 g': 'sobre de 500 g', 'rrhh': 'RR. HH.',
    # redacción: que el pie sea una frase y no una lista de palabras
    'buscar en aplicaciones': ': búsqueda en Aplicaciones', 'resultado y boton activar': ': resultado de la búsqueda y botón Activar',
    'instalando': ': instalación en curso', 'instalado': ': módulo instalado',
    'informacion general': ': pestaña Información general', 'pestana compra proveedor': ', pestaña Compra: proveedor y precio',
    'pestana inventario rutas y lotes': ', pestaña Inventario: rutas y lotes', 'factura proveedor': 'factura de proveedor',
    'asistente registrar pago': ': asistente «Registrar pago»', 'regla reabastecimiento': 'regla de reabastecimiento',
    'regla almacenamiento': 'regla de almacenamiento', 'ajustes inventario': 'ajustes de Inventario:',
    'ajustes fabricacion': 'ajustes de Fabricación:', 'fermentacion continua': '«Fermentación continua 24/7»',
    'con administrator': 'con «Administrator»', 'solo administrator': 'solo «Administrator»',
    'fab y bar': 'FAB y BAR', 'almacen bar': 'almacén BAR',
    'proveedor la cerveceria': 'con la cervecería como proveedor', 'referencia y fecha': 'con la referencia y la fecha',
    'borrador desde el pedido': 'en borrador, creada desde el pedido', 'borrador con referencia': 'en borrador, con la referencia',
    'cerveceria springfield barriles': 'Cervecería Springfield (barriles)',
    'replanificada con capacidad real': 'replanificada tras cambiar la capacidad',
    'productos visibles barriles compartidos': 'los barriles son productos compartidos y también los ve',
}
PALABRAS = {
    'cerveceria': 'cervecería', 'fabricacion': 'fabricación', 'facturacion': 'facturación', 'coccion': 'cocción',
    'companias': 'compañías', 'compania': 'compañía', 'informacion': 'información', 'pestana': 'pestaña',
    'lupulo': 'lúpulo', 'lupulos': 'lúpulos', 'recepcion': 'recepción', 'albaran': 'albarán', 'ubicacion': 'ubicación',
    'ubicaciones': 'ubicaciones', 'categoria': 'categoría', 'categorias': 'categorías', 'produccion': 'producción',
    'logistica': 'logística', 'direccion': 'dirección', 'operacion': 'operación', 'revalorizacion': 'revalorización',
    'valoracion': 'valoración', 'sesion': 'sesión', 'asignacion': 'asignación', 'asignaciones': 'asignaciones',
    'anada': 'añada', 'menu': 'menú', 'boton': 'botón', 'rapido': 'rápido', 'fabrica': 'fábrica',
    'caducidad': 'caducidad', 'numeros': 'números', 'administracion': 'administración', 'linea': 'línea',
    'camara': 'cámara', 'fria': 'fría', 'almacen': 'almacén', 'almacenes': 'almacenes', 'bodega': 'bodega',
    'pedido': 'pedido', 'formulario': 'formulario', 'trazabilidad': 'trazabilidad', 'simulacion': 'simulación',
    'calificacion': 'calificación', 'organigrama': 'organigrama', 'quiosco': 'quiosco', 'publicos': 'públicos',
    'festivo': 'festivo', 'vacio': 'vacío', 'secuencia': 'secuencia', 'prefijo': 'prefijo', 'tecnico': 'técnico',
    'automatica': 'automática', 'caracteristicas': 'características', 'anadir': 'añadir', 'seleccion': 'selección',
    'ordenes': 'órdenes', 'orden': 'orden', 'planificacion': 'planificación', 'subproducto': 'subproducto',
    'materias': 'materias', 'tostada': 'tostada', 'version': 'versión', 'via': 'vía', 'dias': 'días', 'dia': 'día',
    'electronico': 'electrónico', 'codigo': 'código', 'basico': 'básico', 'nomina': 'nómina',
    'conciliados': 'conciliados', 'cuentas': 'cuentas', 'apuntes': 'apuntes',
    'stout': 'Stout', 'cif': 'CIF', 'lineas': 'líneas', 'incorporacion': 'incorporación', 'accion': 'Acción',
    'empresa': 'compañía',
    'sdp': 'SdP', 'ldm': 'LdM', 'of': 'OF', 'ipa': 'IPA', 'pet': 'PET', 'ssh': 'SSH', 'bd': 'BD', 'pin': 'PIN',
    'fefo': 'FEFO', 'wh': 'WH', 'fab': 'FAB', 'bod': 'BOD', 'marta': 'Marta', 'configuracion': 'configuración', 'daniel': 'Daniel', 'javier': 'Javier', 'kanban': 'kanban', 'extra': 'extra',
    'unica': 'única', 'periodo': 'periodo', 'oficina': 'oficina', 'aprobacion': 'aprobación',
    'pagada': 'pagada', 'nocturno': 'nocturno', 'despues': 'después', 'segun': 'según', 'credito': 'crédito',
    'tambien': 'también', 'mas': 'más', 'continua': 'continua', 'pgc': 'PGC', 'mo': 'MO',
}
REFS = [
    (r'\b(fab|bar|bod)-(in|out)-(\d{5})\b', lambda m: '%s/%s/%s' % (m.group(1).upper(), m.group(2).upper(), m.group(3))),
    (r'\bfab-mo-(\d{5})\b', lambda m: 'FAB/MO/' + m.group(1)), (r'\bwh-mo-(\d{5})\b', lambda m: 'WH/MO/' + m.group(1)),
    (r'\bwh-mo\b', lambda m: 'WH/MO'), (r'\bfab-mo\b', lambda m: 'FAB/MO'),
    (r'\binv-2026-(\d{5})\b', lambda m: 'INV/2026/' + m.group(1)), (r'\bub-(\d{5})\b', lambda m: 'UB/' + m.group(1)),
    (r'\b(p|s)(\d{5})\b', lambda m: m.group(1).upper() + m.group(2)),
    (r'\b(ipa|lag|sto|tri)-261123-01\b', lambda m: m.group(1).upper() + '‑261123‑01'),
    (r'\bmd261116-pal\b', lambda m: 'MD261116‑PAL'), (r'\bll-2026-cas-041\b', lambda m: 'LL‑2026‑CAS‑041'),
    (r'\bli-us05-26k19\b', lambda m: 'LI‑US05‑26K19'), (r'\b(\d+)-(\d+)\b', lambda m: m.group(0)),
]

# Pies escritos a mano (los que la regla automática no deja bien)
PIES = {
    1: 'Gestor de bases de datos antes de crear «cerveceria»: solo están taberna-moe y test',
    3: 'Formulario de la BD «cerveceria»: español, España y sin datos de demostración (sin contraseñas todavía)',
    4: 'Las dos contraseñas las escribe el usuario; en la captura solo se ven puntos',
    6: 'Primer acceso a «cerveceria»: solo está Conversaciones',
    27: 'Menú de aplicaciones con los cinco módulos de la fábrica',
    40: 'Selector de compañías de la barra superior: la cervecería y la taberna',
    42: 'Incidencia I-01: la taberna nace sin plan contable (paquete de localización vacío)',
    44: 'Plan contable PyMEs (2008) instalado en la taberna: 635 cuentas, diarios e IVA del 21 %',
    58: 'Ficha del usuario administrador en modo desarrollador',
    64: 'Incidencia I-03: los almacenes se crean solos como «My Company» (WH) y «La taberna de Moe» («La ta»)',
    74: 'Incidencia I-04: «Bodega de vinos» quedó en la compañía de la fábrica',
    79: 'El bar se reabastece desde la Bodega de vinos (ruta entre almacenes)',
    89: 'Incidencia I-05: ubicación «Materias primas» sobrante en la taberna por el autoguardado',
    93: 'Incidencia I-06: la valoración automatizada exige las cuentas de stock («Campos no válidos») y se corrige',
    217: 'Inventario → Ejecutar planificador: lanza todas las reglas de reabastecimiento',
    218: 'Incidencia I-08: las órdenes de fabricación salen con el prefijo antiguo WH/MO',
    227: 'Peticiones de presupuesto creadas solas por las reglas: una por proveedor',
    226: 'Orden FAB/MO/00005 de la IPA esperando a que lleguen los componentes',
    253: 'Horarios de trabajo: solo existe el estándar de 40 horas semanales',
    258: 'Incidencia I-10: el administrador tenía la zona horaria Europe/Berlin',
    265: 'Incidencia I-11: «Debe proporcionar el número de lote» al producir sin marcar los componentes consumidos',
    302: 'Incidencia I-13: las órdenes de trabajo conservan la duración calculada con la capacidad antigua',
    303: 'Vista general de la OF: coste de 382 € por barril, muy por encima del real',
    305: 'Incidencia I-14: «Desmontar» no encuentra los barriles porque están en la ubicación hija Cámara fría',
    308: 'Valoración de los barriles inflada antes de corregirla',
    313: 'Valoración de los barriles después de la revalorización contra la cuenta 712000',
    349: 'Incidencia I-15: Odoo propone avisar al cliente por SMS de pago (IAP): «Deshabilitar SMS»',
    356: 'Incidencia I-16: en la taberna la caducidad se recalcula desde su propia recepción',
    370: 'Incidencia I-17: la copia lanzada desde /home/alumno falla en el find de la rotación',
    371: 'Punto de restauración: copia de «cerveceria» (.dump + filestore) lanzada desde /tmp',
    396: 'Apuntes de la factura INV/2026/00001: 701000 Ventas, 477000 IVA repercutido y 430000 Clientes',
    399: 'Apuntes de la factura en la taberna: 600000 Compras, 472000 IVA soportado y 410000 Acreedores por prestaciones de servicios (debería ser la 400000, ver I-26)',
    414: 'Trazabilidad del lote de lúpulo LL-2026-CAS-041: entró por FAB/IN/00002 y se consumió en FAB/MO/00005',
    417: 'Trazabilidad completa del lote IPA-261123-01: de los lotes de proveedor hasta la entrega a la taberna',
    423: 'Apuntes agrupados por cuenta del PGC: Debe = Haber = 50.817,14 €',
    424: 'Cuenta 430000: factura y cobro conciliados con el mismo número de conciliación',
    425: 'Menú Informes en Community: solo «Análisis de facturas» (balance y PyG son de Enterprise)',
    480: 'Los 14 festivos de 2026 de Alcalá de Henares (nacionales, autonómicos y locales)',
    501: 'Quiosco: Daniel Ortega registra la entrada a las 02:45 para el control nocturno de los fermentadores',
    502: 'Incidencia I-21: abrir el quiosco en el mismo navegador cierra la sesión del administrador',
    498: 'Primer intento de ajustes del quiosco (no llegó a guardarse: incidencia I-23)',
    520: 'Mejora de seguridad I-24: la URL del quiosco que aparece en las capturas de los ajustes',
    521: 'URL del quiosco regenerada antes de publicar (desenfocada en la captura)',
    523: 'Incidencia I-23: «Cambios no guardados» porque falta la fecha «Empezar desde» de las horas extra',
    524: 'Horas extra: empezar a contar desde el 01/11/2026 y mostrarlas en el quiosco',
    525: 'Ajustes de Asistencias guardados: selección manual y recuento de horas extra',
    526: 'Fichajes con horas extra: Javier +1,5 h el 23/11; Daniel aún sin completar la jornada del 24',
    504: 'Fichajes del lunes 23/11 (8 h; Javier 9,5 h) y el control nocturno de Daniel (45 min)',
    519: 'Plantilla final de la fábrica con la nueva incorporación',
}

# Auditoría (2026-11-24): pies escritos a mano para TODAS las figuras de la resumida, para los
# que contradecían la imagen (C-1 a C-3) y para los que salían sin tildes, sin verbo o con el
# género equivocado. Se describe lo que SE VE en la captura, no lo que se hizo después.
PIES.update({
    # C-1, C-2 y C-3: el pie decía «hecha», «terminadas» o «replanificada» y la imagen no lo es
    288: 'OF de la IPA tras cambiar la capacidad: las órdenes de trabajo siguen con la duración antigua (945 min de macerado), origen de la I-13',
    266: 'Primer intento: la OF de la Llamarada Moe IPA sigue Confirmada (0/10) porque faltaba marcar los componentes consumidos (I-11)',
    273: 'Primer intento: la OF de la Springfield Lager sigue Confirmada (0/10), con los componentes sin consumir (I-11)',
    278: 'Primer intento: la OF de la Springfield Stout sigue Confirmada (0/10), con los componentes sin consumir (I-11)',
    283: 'Primer intento: la OF de la Trigo de Shelbyville sigue Confirmada (0/10), con los componentes sin consumir (I-11)',
    267: 'Órdenes de trabajo de la IPA planificadas, aún sin empezar: el macerado dura 945 min porque la capacidad era 1',
    302: 'Incidencia I-13: las órdenes de trabajo terminadas conservan la duración calculada con la capacidad antigua',
    # preparación
    2: 'Gestor de bases de datos: formulario de creación vacío',
    5: 'Inicio de sesión en la base de datos «cerveceria»',
    8: 'Facturación: resultado de la búsqueda y botón Activar',
    28: 'Ajustes generales: bloque Compañías con «My Company»',
    29: 'Ficha de la compañía todavía sin datos',
    30: 'Compañía: nombre «Cervecería artesana Springfield, S.L.»',
    31: 'Datos de la compañía: dirección, CIF y contacto de la cervecería',
    32: 'Compañía: logo subido, todavía sin guardar',
    33: 'Compañía de la cervecería guardada con su logo',
    37: 'Segunda compañía: datos de La taberna de Moe, S.L.',
    39: 'Lista de compañías: la cervecería y la taberna',
    41: 'Compañía activa: La taberna de Moe',
    51: 'Ajustes de Inventario guardados: lotes y números de serie y fechas de caducidad',
    52: 'Ajustes de Inventario guardados: ubicaciones de almacenamiento y rutas multietapa',
    55: 'Ajustes de Fabricación: «Órdenes de trabajo» marcado',
    57: 'Ajustes de Fabricación: «Subproductos» marcado',
    62: 'Grupo de contabilidad completa: se añade el usuario «Administrator»',
    63: 'Grupo «Mostrar características de contabilidad completas» con el administrador',
    69: 'Almacenes renombrados: FAB (Fábrica de Alcalá) y BAR (Bar de la taberna)',
    75: 'Bodega creada en la compañía equivocada: menú Acción → Archivar',
    78: 'Bodega de vinos (BOD) creada de nuevo con la taberna como compañía activa',
    80: 'Almacén BAR guardado con «Reabastecer desde: Bodega de vinos»',
    84: 'Ubicaciones de la fábrica: FAB/Stock/Materias primas y FAB/Stock/Cámara fría',
    87: 'Categoría Peso con las unidades «Saco de 25 kg» y «Sobre de 500 g»',
    94: 'Categoría Maltas: coste promedio, valoración automatizada y cuentas del PGC',
    102: 'Categoría Cerveza en barril: cuentas 350000 y 712000 e ingresos en la 701000',
    108: 'Categorías de producto de la fábrica',
    111: 'Proveedor Maltas del Duero: CIF, dirección y pago a 30 días',
    118: 'Lista de proveedores de la fábrica y de la bodega',
    # productos
    119: 'Producto Malta Pilsen: pestaña Información general',
    120: 'Malta Pilsen, pestaña Compra: proveedor, compra en sacos de 25 kg y precio',
    121: 'Malta Pilsen, pestaña Inventario: rutas, seguimiento por lotes y caducidad',
    137: 'Lúpulo Cascade, pestaña Inventario: rutas, lotes y caducidad',
    147: 'Levadura US-05, pestaña Inventario: rutas, lotes y caducidad',
    160: 'Barril PET 30 L: pestaña Inventario',
    164: 'Producto Bagazo guardado',
    165: 'Barril Llamarada Moe IPA: pestaña Información general',
    166: 'Barril Llamarada Moe IPA, pestaña Inventario: rutas Comprar y Fabricar, lotes y caducidad',
    177: 'Reglas de almacenamiento de la fábrica: materias primas y barriles',
    182: 'Centros de trabajo de la fábrica',
    185: 'Lista de materiales de la IPA: componentes para 10 barriles',
    187: 'Lista de materiales de la IPA: operación 4, fermentación',
    188: 'Lista de materiales de la IPA: las cinco operaciones',
    189: 'Lista de materiales de la IPA: subproducto bagazo',
    190: 'Lista de materiales de la IPA guardada',
    212: 'Listas de materiales de las cuatro cervezas',
    # compras automáticas
    214: 'Regla de reabastecimiento de la Malta Pale Ale (Comprar), en edición',
    215: 'Regla de reabastecimiento de la IPA (Fabricar), en edición',
    216: 'Reglas de reabastecimiento de la fábrica',
    221: 'Secuencia de producción corregida con el prefijo FAB/MO',
    222: 'Secuencias corregidas con los prefijos FAB y BAR',
    225: 'Órdenes de fabricación FAB creadas por el planificador',
    229: 'Pedido de compra P00001 a Maltas del Duero confirmado',
    236: 'Pedidos de compra confirmados',
    239: 'Recepción de Maltas del Duero: lote del proveedor MD261116-PAL',
    240: 'Recepción de Maltas del Duero con sus lotes, antes de validar',
    241: 'Recepción de Maltas del Duero validada',
    243: 'Recepción de Lúpulos de León: lote LL-2026-CAS-041',
    252: 'Recepción de Envases Técnicos del Henares validada',
    # fabricación
    255: 'Horario «Fermentación continua 24/7»: siete días y zona horaria Europe/Madrid',
    256: 'Horario «Fermentación continua 24/7» guardado',
    257: 'Centro Fermentadores con el horario 24/7',
    262: 'OF de la IPA planificada con sus órdenes de trabajo',
    287: 'Centros de trabajo con la capacidad en barriles',
    289: 'OF de la IPA con los componentes consumidos y sus lotes',
    290: 'OF de la IPA hecha en el segundo intento',
    292: 'OF de la IPA: bagazo producido como subproducto',
    309: 'Revalorización del stock de la IPA contra la cuenta 712000',
    # la taberna compra
    315: 'Taberna: barril de IPA con la cervecería como proveedor',
    319: 'Vino crianza Ribera del Duero: pestaña Información general',
    321: 'Vino crianza Ribera del Duero, pestaña Inventario: lotes por añada',
    330: 'Regla de la taberna: barriles comprados a la cervecería, en edición',
    332: 'Regla del bar: reabastecer el vino desde la bodega, en edición',
    333: 'Reglas de reabastecimiento de la taberna',
    335: 'Peticiones de presupuesto generadas por el planificador de la taberna',
    337: 'Taberna: pedido P00005 de barriles a la Cervecería Springfield confirmado',
    344: 'Fábrica: presupuesto a la taberna con las líneas de barriles',
    345: 'Fábrica: presupuesto con la referencia del cliente P00005',
    346: 'Fábrica: pedido de venta confirmado, con su entrega',
    348: 'Albarán de la fábrica: lote de IPA reservado por FEFO desde la Cámara fría',
    350: 'Albarán FAB/OUT/00001 validado',
    352: 'Taberna: recepción con el lote de la fábrica IPA-261123-01',
    354: 'Taberna: recepción de los barriles validada',
    358: 'Taberna: lotes con la caducidad del fabricante',
    360: 'Bodega: recepción del vino de Valdecuevas con el lote «Añada 2022»',
    365: 'Traslado BOD/OUT/00001: salida de la bodega reservada',
    369: 'Traslado BAR/IN/00001: entrada en el bar validada',
    # facturación
    372: 'Factura de proveedor de Maltas del Duero en borrador, creada desde el pedido',
    374: 'Factura de proveedor de Maltas del Duero confirmada',
    375: 'Factura de Maltas del Duero: asistente «Registrar pago»',
    376: 'Factura de Maltas del Duero pagada',
    395: 'Fábrica: factura de cliente a la taberna confirmada',
    397: 'Taberna: factura de la Cervecería Springfield en borrador, con la referencia de su factura',
    401: 'Taberna: factura de la Cervecería Springfield pagada',
    410: 'Fábrica: asistente «Registrar pago» para el cobro de INV/2026/00001',
    411: 'Fábrica: cobro registrado y factura INV/2026/00001 pagada',
    419: 'Desecho de un barril de Stout con fuga en la válvula: datos',
    420: 'Desecho del barril de Stout hecho',
    422: 'Fábrica: asientos contables de todo el flujo',
    # RR. HH.
    446: 'Menú de aplicaciones con los módulos de RR. HH.',
    449: 'Departamentos de la fábrica',
    453: 'Puestos de trabajo de la fábrica',
    454: 'Empleados iniciales: solo «Administrator»',
    456: 'Empleada Lucía Herrero: datos de la ficha',
    458: 'Empleada Lucía Herrero, pestaña Ajustes de RR. HH.: código PIN del quiosco (desenfocado)',
    464: 'Plantilla de la fábrica en vista kanban',
    466: 'Organigrama de departamentos',
    467: 'Ficha de Marta Sanz con su organigrama',
    469: 'Contrato de Lucía Herrero: datos',
    471: 'Contrato de Lucía Herrero en curso',
    477: 'Contratos de la plantilla',
    482: 'Asignación de vacaciones 2026 por compañía: 22 días',
    487: 'Asignaciones de vacaciones prorrateadas por fecha de alta',
    488: 'Solicitud de vacaciones de Marta Sanz',
    491: 'Vacaciones de Marta Sanz aprobadas por su responsable',
    494: 'Vista general de ausencias',
    496: 'Vacaciones de Marta Sanz validadas por RR. HH. (segunda aprobación)',
    507: 'Candidatura de Sara Vidal: datos',
    510: 'Candidatura de Sara Vidal en la etapa «Primera entrevista»',
    513: 'Candidatura de Sara Vidal en la etapa «Contrato firmado»',
    514: 'Empleada Sara Vidal creada desde la candidatura',
    517: 'Contrato temporal de Sara Vidal guardado: empieza el 1/12/2026',
    518: 'Contratos con la nueva incorporación',
})


def auto(slug):
    t = ' ' + slug + ' '
    for rx, fn in REFS:
        t = re.sub(rx, fn, t)
    t = t.replace('-', ' ')
    for k in sorted(FRASES, key=len, reverse=True):
        t = re.sub(r'(?<![\w/])' + re.escape(k) + r'(?![\w])', FRASES[k], t)
    t = ' '.join(PALABRAS.get(w, w) for w in t.split())
    t = t.replace('‑', '-').replace(' :', ':').replace(' ,', ',')
    # «Taberna factura…» → «Taberna: factura…» (quién lo hace, dos puntos, qué se ve)
    t = re.sub(r'^(taberna|fábrica|bodega(?= recepción)) ', lambda m: m.group(1) + ': ', t, flags=re.I)
    # una frase terminada en «datos» es el formulario relleno antes de guardar
    t = re.sub(r' datos$', ': datos introducidos', t)
    # género de las empleadas
    t = re.sub(r'^empleado (Lucía|Marta|Elena|Sara)', r'empleada \1', t, flags=re.I)
    # listas sin registros y formularios a medias
    t = re.sub(r' vacío$', ' (lista vacía)' if ':' in t else ': lista vacía', t)
    t = re.sub(r' editando$', ', en edición', t)
    return t[0].upper() + t[1:]


def pie(n):
    return PIES.get(n) or auto(slugs()[n])


if __name__ == '__main__':
    for n in sorted(slugs()):
        print('%03d %s' % (n, pie(n)))
