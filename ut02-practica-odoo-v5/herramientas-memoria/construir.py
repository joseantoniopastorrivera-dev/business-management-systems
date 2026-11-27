# -*- coding: utf-8 -*-
# Genera la memoria .docx de la v5 con el formato de siempre (A4, márgenes 2 cm, Arial 12,
# títulos azul 1F3864, código Consolas 9,5 sombreado, pie «Figura N.», índice e índice de incidencias).
#
# Uso: python construir.py completa|resumida [--borrador]
#   Las rutas salen de config.json; las figuras y sus pies, de capturas.json (el manifiesto).
#   --borrador permite figuras sin pie revisado (salen con «[BORRADOR]»); sin él, falla.
#
# Cambios respecto a la v4:
#   - una sola fuente de verdad para las figuras (manifiesto) en vez de rangos + pies generados;
#   - imágenes reducidas y en PNG de paleta al insertarlas (memorias mucho más ligeras);
#   - tamaño de figura según su ancho real (una captura recortada no se estira hasta 16 cm);
#   - tablas con cabecera repetida y columnas que no parten palabras; portada sin número de página.
import io, json, os, re, sys
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)                                   # ut02-practica-odoo-v5
sys.path.insert(0, AQUI)
from contenido_v5 import PORTADA, VERSION, INCIDENCIAS, INCIDENCIAS_DETALLE, C

MODO = sys.argv[1] if len(sys.argv) > 1 else 'completa'
BORRADOR = '--borrador' in sys.argv
if MODO not in ('completa', 'resumida'):
    sys.exit('modo: completa | resumida')
with open(os.path.join(AQUI, 'config.json'), encoding='utf-8') as f:
    CFG = json.load(f)
CAPT = os.path.join(RAIZ, CFG['capturas'])
with open(os.path.join(RAIZ, CFG['manifiesto']), encoding='utf-8') as f:
    MANIF = json.load(f)
SALIDA = os.path.join(RAIZ, '%s-%s.docx' % (CFG['salida'], MODO))
ESCALA = CFG['viewport']['escala']
AZUL = RGBColor(0x1F, 0x38, 0x64)


def pie_de(fid):
    """Pie a mano del manifiesto. Si falta o la captura cambió después de revisarlo, es un error (o borrador)."""
    e = MANIF.get(fid)
    if e is None:
        sys.exit('figura sin entrada en el manifiesto: ' + fid)
    if e.get('pie') and e.get('revisado') == e.get('md5'):
        return e['pie']
    if BORRADOR:
        return '[BORRADOR] ' + (e.get('pie') or e.get('borrador') or fid)
    sys.exit('figura sin pie revisado: %s (escribe el pie y pon "revisado" = md5)' % fid)


# Expandir las figuras y filtrar por versión
C2 = []
for e in C:
    if e[0] in ('fig', 'figs'):
        for fid in ([e[1]] if e[0] == 'fig' else e[1]):
            if MODO == 'completa' or MANIF.get(fid, {}).get('resumida'):
                C2.append(('fig', fid, pie_de(fid)))
    elif e[0] == 'pc':
        if MODO == 'completa':
            C2.append(('p', e[1]))
    elif e[0] == 'pr':
        if MODO == 'resumida':
            C2.append(('p', e[1]))
    else:
        C2.append(e)

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
for m in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'):
    setattr(sec, m, Cm(2))
sec.different_first_page_header_footer = True                # la portada no lleva «página 1»

st = doc.styles['Normal']
st.font.name = 'Arial'; st.font.size = Pt(12)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
st.paragraph_format.space_after = Pt(6)
for nombre, tam in (('Heading 1', 16), ('Heading 2', 14)):
    h = doc.styles[nombre]
    h.font.name = 'Arial'; h.font.size = Pt(tam); h.font.bold = True; h.font.color.rgb = AZUL
    h.element.rPr.rFonts.set(qn('w:ascii'), 'Arial'); h.element.rPr.rFonts.set(qn('w:hAnsi'), 'Arial')
    h.paragraph_format.space_before = Pt(18 if tam == 16 else 12); h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
cap = doc.styles['Caption']
cap.font.name = 'Arial'; cap.font.size = Pt(10); cap.font.italic = True; cap.font.bold = False
cap.font.color.rgb = RGBColor(0x40, 0x40, 0x40)
cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
cap.paragraph_format.space_after = Pt(12)


def campo(parrafo, instr, tam=None):
    """Inserta un campo (PAGE, TOC...) en el párrafo."""
    def run(tipo=None, texto=None):
        r = OxmlElement('w:r')
        if tam:
            rpr = OxmlElement('w:rPr'); sz = OxmlElement('w:sz'); sz.set(qn('w:val'), str(tam)); rpr.append(sz); r.append(rpr)
        if tipo:
            fc = OxmlElement('w:fldChar'); fc.set(qn('w:fldCharType'), tipo); r.append(fc)
        if texto is not None:
            it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = texto; r.append(it)
        parrafo._p.append(r)
    run('begin'); run(texto=instr); run('separate'); run('end')


def texto_rico(par, texto):
    """**negrita** y *cursiva* dentro de un párrafo."""
    for trozo in re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*)', texto):
        if not trozo:
            continue
        if trozo.startswith('**'):
            par.add_run(trozo[2:-2]).bold = True
        elif trozo.startswith('*'):
            par.add_run(trozo[1:-1]).italic = True
        else:
            par.add_run(trozo)


def sombreado(elem, color):
    shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), color)
    elem.append(shd)


def anchos_auto(cab, filas, total=17.0):
    """Ancho proporcional al texto de cada columna, pero nunca menor que su palabra más larga
    (a 10 pt, unos 0,21 cm por carácter + 0,4 de márgenes de celda), para no partir «Caducida/d»."""
    largos, minimos = [], []
    for i in range(len(cab)):
        textos = [cab[i]] + [f[i] for f in filas]
        largos.append(max(min(len(t), 60) for t in textos))
        palabra = max((len(p) for t in textos for p in t.split()), default=1)
        minimos.append(max(1.6, palabra * 0.21 + 0.4))
    anchos = [max(mn, total * l / sum(largos)) for l, mn in zip(largos, minimos)]
    exceso = sum(anchos) - total
    if exceso > 0:      # recortar solo de las columnas que están por encima de su mínimo
        holgura = [a - mn for a, mn in zip(anchos, minimos)]
        anchos = [a - exceso * h / sum(holgura) if sum(holgura) else a * total / sum(anchos) for a, h in zip(anchos, holgura)]
    return anchos


def tabla(cab, filas, anchos=None):
    t = doc.add_table(rows=1, cols=len(cab)); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, c in enumerate(cab):
        cel = t.rows[0].cells[i]; cel.text = ''
        r = cel.paragraphs[0].add_run(c); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        sombreado(cel._tc.get_or_add_tcPr(), '1F3864')
    # la cabecera se repite en cada página si la tabla se parte
    th = OxmlElement('w:tblHeader'); th.set(qn('w:val'), 'true'); t.rows[0]._tr.get_or_add_trPr().append(th)
    for fila in filas:
        celdas = t.add_row().cells
        for i, v in enumerate(fila):
            celdas[i].text = ''
            celdas[i].paragraphs[0].add_run(v).font.size = Pt(10)
    anchos = anchos or anchos_auto(cab, filas)
    t.autofit = False
    # rejilla fija: OpenOffice solo respeta los anchos si están en w:tblGrid y el diseño es fijo
    lay = OxmlElement('w:tblLayout'); lay.set(qn('w:type'), 'fixed'); t._tbl.tblPr.append(lay)
    for i, gc in enumerate(t._tbl.tblGrid.findall(qn('w:gridCol'))):
        gc.set(qn('w:w'), str(int(anchos[i] * 567)))
    for fila in t.rows:
        for i, a in enumerate(anchos):
            fila.cells[i].width = Cm(a)
    doc.add_paragraph()
    return t


def imagen(ruta):
    """Devuelve (flujo PNG ligero, ancho en cm). Máx. 1800 px de ancho y paleta de 256 colores:
    la interfaz de Odoo tiene pocos colores y el texto sigue nítido. El ancho impreso es el de la
    pantalla a un 125 % (px CSS / 96 × 2,54 × 1,25), con tope de 16 cm y 11,5 cm de alto."""
    im = Image.open(ruta).convert('RGB')
    # recorte del fondo sobrante (mismo color que la esquina inferior derecha), con 16 px de margen:
    # solo en la copia que va al documento; el PNG del manifiesto no se toca
    from PIL import ImageChops
    fondo = Image.new('RGB', im.size, im.getpixel((im.width - 1, im.height - 1)))
    caja = ImageChops.difference(im, fondo).convert('L').point(lambda v: 255 if v > 12 else 0).getbbox()
    if caja:
        x0, y0, x1, y1 = caja
        im = im.crop((max(0, x0 - 16), max(0, y0 - 16), min(im.width, x1 + 16), min(im.height, y1 + 16)))
    w, h = im.size
    ancho = min(16.0, (w / ESCALA) / 96 * 2.54 * 1.25)
    if ancho * h / w > 11.5:
        ancho = 11.5 * w / h
    if w > 1800:
        im = im.resize((1800, round(h * 1800 / w)), Image.LANCZOS)
    buf = io.BytesIO()
    im.quantize(256, method=Image.Quantize.FASTOCTREE).save(buf, 'PNG', optimize=True)
    buf.seek(0)
    return buf, ancho


# ------------------------------------------------------------ portada
for _ in range(2):
    doc.add_paragraph()
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
p.add_run().add_picture(os.path.join(RAIZ, CFG['logo']), width=Cm(4.5))
PORTADA['version'] = VERSION[MODO]
for clave, tam, neg in (('linea1', 16, False), ('titulo', 24, True), ('subtitulo', 16, False), ('caso', 14, False), ('version', 13, True)):
    p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(PORTADA[clave]); r.font.size = Pt(tam); r.bold = neg
    if clave == 'titulo':
        r.font.color.rgb = AZUL
for _ in range(3):
    doc.add_paragraph()
for clave in ('alumno', 'profesora', 'centro', 'fecha'):
    p = doc.add_paragraph(PORTADA[clave]); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# ------------------------------------------------------------ índices
p = doc.add_paragraph(); r = p.add_run('Índice'); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = AZUL
campo(doc.add_paragraph(), 'TOC \\o "1-2" \\h \\z \\u')
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
if INCIDENCIAS:
    p = doc.add_paragraph(); r = p.add_run('Índice de incidencias'); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = AZUL
    tabla(['Nº', 'Incidencia', 'Apartado', 'Estado'], [list(i) for i in INCIDENCIAS], [1.6, 11, 2, 2.4])
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# ------------------------------------------------------------ cuerpo
nfig = 0
usadas = []
for e in C2:
    tipo = e[0]
    if tipo == 'h1':
        doc.add_heading(e[1], level=1)
    elif tipo == 'h2':
        doc.add_heading(e[1], level=2)
    elif tipo == 'p':
        texto_rico(doc.add_paragraph(), e[1])
    elif tipo == 'lis':
        for item in e[1]:
            p = doc.add_paragraph(); p.paragraph_format.left_indent = Cm(0.6); p.paragraph_format.first_line_indent = Cm(-0.6)
            p.add_run('•  ').bold = True; texto_rico(p, item)
    elif tipo == 'code':
        for i, linea in enumerate(e[1]):
            p = doc.add_paragraph(); pf = p.paragraph_format
            pf.space_after = Pt(8 if i == len(e[1]) - 1 else 0); pf.space_before = Pt(0); pf.left_indent = Cm(0.3)
            pf.keep_with_next = i < len(e[1]) - 1
            sombreado(p._p.get_or_add_pPr(), 'F2F2F2')
            r = p.add_run(linea if linea else ' '); r.font.name = 'Consolas'; r.font.size = Pt(9.5)
            r._element.rPr.rFonts.set(qn('w:hAnsi'), 'Consolas')
    elif tipo == 'tab':
        tabla(e[1], e[2])
    elif tipo == 'fig':
        fid, pie = e[1], e[2]
        ruta = os.path.join(CAPT, MANIF[fid]['archivo']); usadas.append(fid)
        flujo, ancho = imagen(ruta)
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next = True
        p.paragraph_format.space_after = Pt(2)
        p.add_run().add_picture(flujo, width=Cm(ancho))
        nfig += 1
        doc.add_paragraph('Figura %d. %s' % (nfig, pie), style='Caption')
    elif tipo == 'incid':
        if INCIDENCIAS_DETALLE:
            doc.add_paragraph('Resumen de todas las incidencias, con su causa y su solución. Cada una está explicada con sus capturas en el apartado indicado.')
            tabla(['Nº', 'Incidencia', 'Causa y solución'], [list(i) for i in INCIDENCIAS_DETALLE], [1.5, 5, 10.5])

# ------------------------------------------------------------ pie de página (desde la 2ª página)
pie = sec.footer.paragraphs[0]; pie.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = pie.add_run(PORTADA['pie']); r.font.size = Pt(9)
campo(pie, 'PAGE', 18)
upd = OxmlElement('w:updateFields'); upd.set(qn('w:val'), 'true'); doc.settings.element.append(upd)   # Word actualiza el índice al abrir
doc.core_properties.author = 'José Antonio Pastor Rivera'
doc.core_properties.title = 'UT02. Práctica integradora v5 - Cervecería artesana Springfield (' + MODO + ')'
doc.save(SALIDA)

sin_usar = sorted(set(MANIF) - set(usadas))
repes = sorted({f for f in usadas if usadas.count(f) > 1})
print('%s: %d figuras | sin usar: %s | repetidas: %s' % (MODO, nfig, len(sin_usar) if MODO == 'resumida' else sin_usar, repes))
