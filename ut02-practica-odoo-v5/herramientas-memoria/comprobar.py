# -*- coding: utf-8 -*-
# Comprobador de la v5. Se pasa antes de generar las memorias (todo.ps1 lo llama) y antes de cada commit.
#
#   python comprobar.py                 comprobación completa (sale con código 1 si hay errores)
#   python comprobar.py --borrador      los pies sin revisar son avisos, no errores
#   python comprobar.py --revisado ID…  marca esos pies como revisados (revisado = md5 actual de la imagen)
#
# Qué comprueba:
#   1. Manifiesto ↔ capturas: cada entrada tiene su PNG, cada PNG su entrada y el MD5 coincide.
#   2. Contenido ↔ manifiesto: cada figura citada existe; avisa de capturas sin usar.
#   3. Pies: escritos a mano y revisados DESPUÉS de la última captura (si se rehace la imagen, hay que
#      volver a mirarla). Así no se repite la Figura 70 de la v4 (pie que contradice la imagen).
#   4. Capturas idénticas byte a byte (salvo que la entrada diga "repetida_ok": true).
#   5. Secretos: UUID, tokens de GitHub/OpenAI/AWS, claves privadas y «password = '…'» en los ficheros
#      de texto de la v5 y en todo lo que esté en el área de preparación de Git (git add).
#      Una línea que de verdad lo necesite se marca con el comentario «secreto-ok».
#   6. Área de preparación: nada de .env, contraseñas, guías de defensa ni notas; aviso si un fichero pasa de 25 MB.
import hashlib, json, os, re, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
REPO = os.path.dirname(RAIZ)
with open(os.path.join(AQUI, 'config.json'), encoding='utf-8') as f:
    CFG = json.load(f)
CAPT = os.path.join(RAIZ, CFG['capturas'])
MANIF_RUTA = os.path.join(RAIZ, CFG['manifiesto'])

errores, avisos = [], []


def md5(ruta):
    with open(ruta, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()


def leer_manifiesto():
    if not os.path.exists(MANIF_RUTA):
        return {}
    with open(MANIF_RUTA, encoding='utf-8') as f:
        return json.load(f)


# ---------------------------------------------------------------- modo --revisado
if '--revisado' in sys.argv:
    m = leer_manifiesto()
    for fid in sys.argv[sys.argv.index('--revisado') + 1:]:
        e = m.get(fid)
        if not e:
            print('no existe:', fid); continue
        if not e.get('pie'):
            print('sin pie, no se marca:', fid); continue
        e['revisado'] = md5(os.path.join(CAPT, e['archivo']))
        print('revisado:', fid)
    with open(MANIF_RUTA, 'w', encoding='utf-8') as f:
        f.write(json.dumps(m, ensure_ascii=False, indent=2) + '\n')
    sys.exit(0)

BORRADOR = '--borrador' in sys.argv
MANIF = leer_manifiesto()

# ---------------------------------------------------------------- 1. manifiesto ↔ capturas
pngs = {f for f in os.listdir(CAPT) if f.endswith('.png')} if os.path.isdir(CAPT) else set()
actual = {}
for fid, e in MANIF.items():
    ruta = os.path.join(CAPT, e.get('archivo', ''))
    if not os.path.isfile(ruta):
        errores.append('manifiesto: falta la imagen de %s (%s)' % (fid, e.get('archivo')))
        continue
    actual[fid] = md5(ruta)
    if actual[fid] != e.get('md5'):
        errores.append('manifiesto: %s cambió fuera de run.js (md5 distinto): recaptúrala con su paso' % fid)
for f in sorted(pngs - {e.get('archivo') for e in MANIF.values()}):
    errores.append('capturas: %s no está en el manifiesto (¿sonda guardada en capturas/?)' % f)

# ---------------------------------------------------------------- 2 y 3. contenido ↔ manifiesto y pies
sys.path.insert(0, AQUI)
from contenido_v5 import C  # noqa: E402
citadas = []
for b in C:
    if b[0] == 'fig':
        citadas.append(b[1])
    elif b[0] == 'figs':
        citadas.extend(b[1])
for fid in citadas:
    e = MANIF.get(fid)
    if e is None:
        errores.append('contenido: la figura %s no existe en el manifiesto' % fid)
        continue
    if not e.get('pie'):
        (avisos if BORRADOR else errores).append('pie: %s no tiene pie escrito' % fid)
    elif e.get('revisado') != actual.get(fid):
        (avisos if BORRADOR else errores).append('pie: %s se capturó después de revisar el pie (o nunca se revisó): mírala y usa --revisado' % fid)
for fid in sorted({c for c in citadas if citadas.count(c) > 1}):
    avisos.append('contenido: %s se cita más de una vez' % fid)
for fid in sorted(set(MANIF) - set(citadas)):
    avisos.append('sin usar: %s' % fid)

# ---------------------------------------------------------------- 4. duplicados por MD5
por_md5 = {}
for fid, h in actual.items():
    por_md5.setdefault(h, []).append(fid)
for h, ids in por_md5.items():
    if len(ids) > 1 and not all(MANIF[i].get('repetida_ok') for i in ids):
        errores.append('duplicadas (idénticas byte a byte): ' + ', '.join(sorted(ids)))

# ---------------------------------------------------------------- 5. secretos
PATRONES = [
    ('UUID (clave de quiosco, token…)', re.compile(r'\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b', re.I)),
    ('token de GitHub', re.compile(r'\b(gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})')),
    ('clave de API (sk-…)', re.compile(r'\bsk-[A-Za-z0-9_-]{20,}')),
    ('clave de AWS', re.compile(r'\bAKIA[0-9A-Z]{16}\b')),
    ('clave privada', re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----')),
    ('contraseña o token literal', re.compile(r'(pass(word)?|passwd|contrase(ñ|n)a|token|api[_-]?key|secret|admin_passwd|master_pwd)\s*["\']?\s*[:=]\s*["\'][^"\'\s]{6,}["\']', re.I)),
]
TEXTO = ('.py', '.js', '.json', '.ps1', '.md', '.txt', '.yaml', '.yml', '.sh', '.conf', '.html', '.xml', '.csv')


def buscar_secretos(nombre, texto):
    for n, linea in enumerate(texto.splitlines(), 1):
        if 'secreto-ok' in linea:
            continue
        for desc, rx in PATRONES:
            if rx.search(linea):
                errores.append('secreto (%s): %s:%d' % (desc, nombre, n))


for base, dirs, files in os.walk(RAIZ):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '_sondas', '__pycache__', '_cache')]
    for f in files:
        if f.endswith(TEXTO):
            ruta = os.path.join(base, f)
            with open(ruta, encoding='utf-8', errors='replace') as fh:
                buscar_secretos(os.path.relpath(ruta, REPO), fh.read())


def git(*args):
    return subprocess.run(['git', '-C', REPO] + list(args), capture_output=True, text=True, encoding='utf-8').stdout


preparados = [x for x in git('diff', '--cached', '--name-only', '--diff-filter=ACMR').splitlines() if x]
for f in preparados:
    if f.endswith(TEXTO):
        buscar_secretos('[git add] ' + f, git('show', ':' + f))

# ---------------------------------------------------------------- 6. área de preparación
PROHIBIDOS = re.compile(r'(^|/)(\.env[^/]*|contrasena[^/]*|token[^/]*\.txt|guia-defensa-[^/]*\.md|_notas-[^/]*\.md|_auditoria-[^/]*\.md)$', re.I)
for f in preparados:
    if PROHIBIDOS.search(f):
        errores.append('git add: %s no se puede subir' % f)
    ruta = os.path.join(REPO, f)
    if os.path.isfile(ruta) and os.path.getsize(ruta) > 25 * 1024 * 1024:
        avisos.append('git add: %s pesa %.0f MB (súbelo en un commit propio)' % (f, os.path.getsize(ruta) / 1048576))

# ---------------------------------------------------------------- informe
res = sum(1 for e in MANIF.values() if e.get('resumida'))
print('capturas: %d | citadas: %d | en la resumida: %d | preparadas en git: %d' % (len(MANIF), len(set(citadas)), res, len(preparados)))
for a in avisos:
    print('AVISO  ' + a)
for e in errores:
    print('ERROR  ' + e)
print('OK' if not errores else '%d errores' % len(errores))
sys.exit(1 if errores else 0)
