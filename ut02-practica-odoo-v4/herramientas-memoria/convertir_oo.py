# -*- coding: utf-8 -*-
# Python 2.7 de OpenOffice 4: .docx -> .odt (actualizando el índice) -> .pdf
import os, sys, time, subprocess
OO = r'C:\Program Files (x86)\OpenOffice 4\program'
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

null = open(os.devnull, 'w')
proc = subprocess.Popen([OO + r'\soffice.exe', '-headless', '-invisible', '-nologo', '-norestore',
                         '-accept=socket,host=127.0.0.1,port=2002;urp;'],
                        stdout=null, stderr=null, creationflags=0x8)
ctx = None
local = uno.getComponentContext()
resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
for i in range(60):
    try:
        ctx = resolver.resolve('uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext')
        break
    except Exception:
        time.sleep(1)
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
print('ok ' + pdf)
