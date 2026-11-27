# Quita del .odt los marcos de imagen duplicados anclados a página y la numeración de capítulos.
import sys, re, zipfile, shutil, os
src = sys.argv[1]; tmp = src + '.tmp'
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, 'w') as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == 'content.xml':
            s = data.decode('utf-8'); n0 = len(re.findall(r'<draw:frame[^>]*text:anchor-type="page"', s))
            s = re.sub(r'<draw:frame[^>]*text:anchor-type="page"[^>]*>.*?</draw:frame>', '', s, flags=re.S)
            print('marcos anclados a pagina quitados:', n0)
            data = s.encode('utf-8')
        if item.filename == 'styles.xml':
            s = data.decode('utf-8')
            s, n = re.subn(r'(<text:outline-level-style[^>]*?)style:num-format="[^"]*"', r'\1style:num-format=""', s)
            s = re.sub(r'(<text:outline-level-style[^>]*?)style:num-suffix="[^"]*"', r'\1', s)
            print('niveles de esquema sin numeracion:', n)
            data = s.encode('utf-8')
        zout.writestr(item, data, compress_type=zipfile.ZIP_STORED if item.filename == 'mimetype' else zipfile.ZIP_DEFLATED)
shutil.move(tmp, src)
