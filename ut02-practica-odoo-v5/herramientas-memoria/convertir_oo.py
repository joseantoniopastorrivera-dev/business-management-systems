# -*- coding: utf-8 -*-
# Python 2.7 de OpenOffice 4: .docx -> .odt (actualizando el índice) -> .pdf
# v5: la carpeta de OpenOffice llega en OO_DIR (sale de config.json) y se arranca una instancia
# con su propio perfil y su propio puerto, así no se mezcla con un OpenOffice que tengas abierto
# y no hace falta matar todos los soffice al terminar.
import os, sys, time, subprocess, tempfile
OO = os.environ.get('OO_DIR', r'C:\Program Files (x86)\OpenOffice 4\program')
PERFIL = os.path.join(tempfile.gettempdir(), 'oo-perfil-memoria-v5')
PUERTO = '2003'
sys.path.append(OO)
os.environ['PATH'] = OO + ';' + os.environ['PATH']
os.environ['URE_BOOTSTRAP'] = 'vnd.sun.star.pathname:' + OO + r'\fundamental.ini'
import uno
from com.sun.star.beans import PropertyValue

modo, docx, odt, pdf = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]

def prop(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p

def url(path):
    return uno.systemPathToFileUrl(os.path.abspath(path))

def uno_url_perfil():
    return url(PERFIL)

null = open(os.devnull, 'w')
proc = subprocess.Popen([OO + r'\soffice.exe', '-headless', '-invisible', '-nologo', '-norestore', '-nofirststartwizard',
                         '-env:UserInstallation=' + uno_url_perfil(),
                         '-accept=socket,host=127.0.0.1,port=' + PUERTO + ';urp;'],
                        stdout=null, stderr=null, creationflags=0x8)
ctx = None
local = uno.getComponentContext()
resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
for i in range(60):
    try:
        ctx = resolver.resolve('uno:socket,host=127.0.0.1,port=' + PUERTO + ';urp;StarOffice.ComponentContext')
        break
    except Exception:
        time.sleep(1)
if ctx is None:   # no arrancó: se cierra nuestra instancia y se avisa con código de error
    subprocess.call(['taskkill', '/PID', str(proc.pid), '/T', '/F'], stdout=null, stderr=null)
    sys.exit('OpenOffice no responde en el puerto ' + PUERTO)
smgr = ctx.ServiceManager
desktop = smgr.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)

def abrir(path):
    return desktop.loadComponentFromURL(url(path), '_blank', 0, (prop('Hidden', True),))

def actualizar_indices(doc):
    idx = doc.getDocumentIndexes()
    for i in range(idx.getCount()):
        idx.getByIndex(i).update()
    doc.refresh()

# 1) docx -> odt
if modo == 'odt':
  d = abrir(docx)
  actualizar_indices(d)
  d.storeToURL(url(odt), (prop('FilterName', 'writer8'),))
  d.close(True)

# 2) odt -> pdf (reabriendo el .odt para que las imágenes salgan bien)
if modo == 'pdf':
  d = abrir(odt)
  actualizar_indices(d)
  d.store()
  d.storeToURL(url(pdf), (prop('FilterName', 'writer_pdf_Export'),))
  d.close(True)
try:
    desktop.terminate()
except Exception:
    pass
# esperar a que se cierre SOLO nuestra instancia; si no, se cierra a la fuerza ese proceso y sus hijos
for i in range(30):
    if proc.poll() is not None:
        break
    time.sleep(1)
else:
    subprocess.call(['taskkill', '/PID', str(proc.pid), '/T', '/F'], stdout=null, stderr=null)
print('ok ' + pdf)
