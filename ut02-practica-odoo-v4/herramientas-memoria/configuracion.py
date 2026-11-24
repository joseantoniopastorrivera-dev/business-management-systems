# -*- coding: utf-8 -*-
# Lee config.json (rutas y direcciones) para que ningún script lleve rutas fijas.
# Las rutas relativas se resuelven desde la carpeta de config.json.
# La variable de entorno MEMORIA_CONFIG permite usar otro fichero (por ejemplo, para la v5).
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
FICHERO = os.environ.get('MEMORIA_CONFIG', os.path.join(AQUI, 'config.json'))

with open(FICHERO, encoding='utf-8') as f:
    CFG = json.load(f)


def ruta(clave):
    """Devuelve la ruta absoluta de una clave de config.json."""
    return os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(FICHERO)), CFG[clave]))
