# -*- coding: utf-8 -*-
# Escribe el pie de una captura en el manifiesto y la marca como revisada (md5 actual de la imagen).
# Se usa DESPUÉS de mirar la imagen, para que el pie describa lo que se ve de verdad.
#
#   python pie.py ID "Texto del pie." [--resumida] [--apartado "3.2"]
#   python pie.py --lista            muestra las capturas sin pie revisado
import hashlib, json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
with open(os.path.join(AQUI, 'config.json'), encoding='utf-8') as f:
    CFG = json.load(f)
RUTA = os.path.join(RAIZ, CFG['manifiesto'])
with open(RUTA, encoding='utf-8') as f:
    M = json.load(f)


def md5(archivo):
    with open(os.path.join(RAIZ, CFG['capturas'], archivo), 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


if sys.argv[1:2] == ['--lista']:
    for fid, e in M.items():
        if not e.get('pie') or e.get('revisado') != md5(e['archivo']):
            print(fid, '|', e.get('borrador', ''))
    sys.exit(0)

fid, texto = sys.argv[1], sys.argv[2]
if fid not in M:
    sys.exit('no existe en el manifiesto: ' + fid)
if not texto.endswith('.'):
    texto += '.'
e = M[fid]
e['pie'] = texto
e['revisado'] = md5(e['archivo'])
e['resumida'] = '--resumida' in sys.argv
if '--apartado' in sys.argv:
    e['apartado'] = sys.argv[sys.argv.index('--apartado') + 1]
with open(RUTA, 'w', encoding='utf-8') as f:
    f.write(json.dumps(M, ensure_ascii=False, indent=2) + '\n')
print('ok', fid, '(resumida)' if e['resumida'] else '')
