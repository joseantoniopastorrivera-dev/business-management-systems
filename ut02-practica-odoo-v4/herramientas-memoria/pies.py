# -*- coding: utf-8 -*-
# Genera el pie de cada figura a partir del nombre de la captura (NNN-descripcion-con-guiones.png).
# Se corrigen tildes y nombres propios con un diccionario; los pies importantes se escriben a mano en PIES.
import os, re

CAPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'capturas')
SLUG = {int(f[:3]): f[4:-4] for f in os.listdir(CAPT) if f[:3].isdigit() and f.endswith('.png')}

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
    'conciliados': 'conciliados', 'cuentas': 'cuentas', 'apuntes': 'apuntes', 'incidencia': 'Incidencia:',
    'sdp': 'SdP', 'ldm': 'LdM', 'of': 'OF', 'ipa': 'IPA', 'pet': 'PET', 'ssh': 'SSH', 'bd': 'BD', 'pin': 'PIN',
    'fefo': 'FEFO', 'wh': 'WH', 'fab': 'FAB', 'bod': 'BOD', 'marta': 'Marta', 'configuracion': 'configuración', 'daniel': 'Daniel', 'javier': 'Javier', 'kanban': 'kanban', 'extra': 'extra',
    'via': 'vía', 'unica': 'única', 'periodo': 'periodo', 'oficina': 'oficina', 'aprobacion': 'aprobación',
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
    74: 'Incidencia I-04: «Bodega de vinos» quedó en la empresa de la fábrica',
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
    399: 'Apuntes de la factura en la taberna: 600000 Compras, 472000 IVA soportado y 400000 Proveedores',
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


def auto(slug):
    t = ' ' + slug + ' '
    for rx, fn in REFS:
        t = re.sub(rx, fn, t)
    t = t.replace('-', ' ')
    for k in sorted(FRASES, key=len, reverse=True):
        t = re.sub(r'(?<![\w/])' + re.escape(k) + r'(?![\w])', FRASES[k], t)
    t = ' '.join(PALABRAS.get(w, w) for w in t.split())
    t = t.replace('‑', '-')
    return t[0].upper() + t[1:]


def pie(n):
    return PIES.get(n) or auto(SLUG[n])


if __name__ == '__main__':
    for n in sorted(SLUG):
        print('%03d %s' % (n, pie(n)))
