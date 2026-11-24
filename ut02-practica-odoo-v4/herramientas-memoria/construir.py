# -*- coding: utf-8 -*-
# Genera la memoria .docx con el mismo formato que las de las prácticas 1 y 2:
# A4, márgenes 2 cm, Arial 12, títulos azul 1F3864, código Consolas 9,5 sombreado,
# figuras de 16 cm con pie «Figura N.», índice (campo TOC) e índice de incidencias.
import os, re, sys
from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from contenido_v4 import PORTADA, VERSION, INCIDENCIAS, INCIDENCIAS_DETALLE, C, CORTA
from pies import pie as pie_auto

CAPT = sys.argv[1]          # carpeta capturas
LOGO = sys.argv[2]          # logo de la empresa
SALIDA = sys.argv[3]        # .docx de salida
MODO = sys.argv[4] if len(sys.argv) > 4 else 'completa'   # completa | corta
AZUL = RGBColor(0x1F, 0x38, 0x64)

capturas = {int(f[:3]): os.path.join(CAPT, f) for f in os.listdir(CAPT) if f[:3].isdigit() and f.endswith('.png')}
# expandir los rangos de figuras y filtrar la versión corta
C2 = []
for e in C:
    if e[0] == 'figs':
        for n in range(e[1], e[2] + 1):
            if MODO == 'completa' or n in CORTA:
                C2.append(('fig', n, pie_auto(n)))
    elif e[0] == 'pc':
        if MODO == 'completa':
            C2.append(('p', e[1]))
    else:
        C2.append(e)
C = C2

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
for m in ('left_margin', 'right_margin', 'top_margin', 'bottom_margin'):
    setattr(sec, m, Cm(2))

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


def tabla(cab, filas, anchos=None):
    t = doc.add_table(rows=1, cols=len(cab)); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, c in enumerate(cab):
        cel = t.rows[0].cells[i]; cel.text = ''
        r = cel.paragraphs[0].add_run(c); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        sombreado(cel._tc.get_or_add_tcPr(), '1F3864')
    for fila in filas:
        celdas = t.add_row().cells
        for i, v in enumerate(fila):
            celdas[i].text = ''
            celdas[i].paragraphs[0].add_run(v).font.size = Pt(10)
    if not anchos:
        # ancho proporcional al texto más largo de cada columna (mín. 2,2 cm), total 17 cm
        largos = [max(len(cab[i]), *(min(len(f[i]), 60) for f in filas)) for i in range(len(cab))]
        anchos = [max(2.2, 17.0 * l / sum(largos)) for l in largos]
        k = 17.0 / sum(anchos); anchos = [a * k for a in anchos]
    t.autofit = False
    # rejilla fija: OpenOffice solo respeta los anchos si están en w:tblGrid y el diseño es fijo
    tblPr = t._tbl.tblPr
    lay = OxmlElement('w:tblLayout'); lay.set(qn('w:type'), 'fixed'); tblPr.append(lay)
    grid = t._tbl.tblGrid
    for i, gc in enumerate(grid.findall(qn('w:gridCol'))):
        gc.set(qn('w:w'), str(int(anchos[i] * 567)))
    for fila in t.rows:
        for i, a in enumerate(anchos):
            fila.cells[i].width = Cm(a)
    doc.add_paragraph()
    return t


# ------------------------------------------------------------ portada
for _ in range(2):
    doc.add_paragraph()
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(LOGO, width=Cm(4.5))
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

# ------------------------------------------------------------ índice
p = doc.add_paragraph(); r = p.add_run('Índice'); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = AZUL
campo(doc.add_paragraph(), 'TOC \\o "1-2" \\h \\z \\u')
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
p = doc.add_paragraph(); r = p.add_run('Índice de incidencias'); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = AZUL
tabla(['Nº', 'Incidencia', 'Apartado', 'Estado'], [list(i) for i in INCIDENCIAS], [1.6, 11, 2, 2.4])
doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

# ------------------------------------------------------------ cuerpo
nfig = 0
usadas = []
primer_h1 = True
for e in C:
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
            pf.space_after = Pt(0); pf.space_before = Pt(0); pf.left_indent = Cm(0.3)
            if i == len(e[1]) - 1:
                pf.space_after = Pt(8)
            pf.keep_with_next = i < len(e[1]) - 1
            sombreado(p._p.get_or_add_pPr(), 'F2F2F2')
            r = p.add_run(linea if linea else ' '); r.font.name = 'Consolas'; r.font.size = Pt(9.5)
            r._element.rPr.rFonts.set(qn('w:hAnsi'), 'Consolas')
    elif tipo == 'tab':
        tabla(e[1], e[2])
    elif tipo == 'fig':
        num, pie = e[1], e[2]
        ruta = capturas[num]; usadas.append(num)
        w, h = Image.open(ruta).size
        ancho, alto = 16.0, 16.0 * h / w
        if alto > 11.5:
            alto = 11.5; ancho = alto * w / h
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next = True
        p.paragraph_format.space_after = Pt(2)
        p.add_run().add_picture(ruta, width=Cm(ancho))
        nfig += 1
        doc.add_paragraph('Figura %d. %s' % (nfig, pie), style='Caption')
    elif tipo == 'incid':
        P0 = doc.add_paragraph('Resumen de todas las incidencias, con su causa y su solución. Cada una está explicada con sus capturas en el apartado indicado.')
        tabla(['Nº', 'Incidencia', 'Causa y solución'], [list(i) for i in INCIDENCIAS_DETALLE], [1.5, 5, 10.5])

# ------------------------------------------------------------ pie de página
pie = sec.footer.paragraphs[0]; pie.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = pie.add_run(PORTADA['pie']); r.font.size = Pt(9)
campo(pie, 'PAGE', 18)
# Que Word actualice el índice al abrir
upd = OxmlElement('w:updateFields'); upd.set(qn('w:val'), 'true'); doc.settings.element.append(upd)
doc.core_properties.author = 'José Antonio Pastor Rivera'
doc.core_properties.title = 'UT02. Práctica integradora v4 - Cervecería artesana Springfield (' + MODO + ')'
doc.save(SALIDA)

faltan = sorted(set(capturas) - set(usadas)) if MODO == 'completa' else len(set(capturas) - set(usadas))
repes = sorted({n for n in usadas if usadas.count(n) > 1})
print('figuras:', nfig, '| capturas sin usar:', faltan, '| repetidas:', repes)
