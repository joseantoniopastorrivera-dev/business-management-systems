#!/bin/bash
# backup-odoo.sh — Copia de seguridad diaria del Odoo 17 nativo (UT02 · Práctica 2 · §8)
# Copia cada base de datos (pg_dump en formato custom) y su filestore, y borra las copias de más de 7 días.
# Se instala en /usr/local/bin y la lanza el cron del usuario «odoo» todos los días a las 02:30.
set -euo pipefail                      # parar ante cualquier error, variable sin definir o fallo en una tubería

DESTINO=/var/backups/odoo              # carpeta de las copias (solo la puede leer odoo)
FILESTORE=/home/odoo/.local/share/Odoo/filestore
DIAS=7                                 # rotación: se guardan las copias de los últimos 7 días
FECHA=$(date +%F_%H-%M)                # p. ej. 2026-11-19_02-30

umask 077                              # todo lo que se cree, solo para el propietario (600 / 700)
mkdir -p "$DESTINO"

# Todas las bases de Odoo, sin las de sistema de PostgreSQL
for BD in $(psql -d postgres -tAc "select datname from pg_database where not datistemplate and datname <> 'postgres'"); do
  pg_dump -Fc -d "$BD" -f "$DESTINO/${BD}_${FECHA}.dump"                  # BD en formato comprimido de pg_restore
  if [ -d "$FILESTORE/$BD" ]; then
    tar czf "$DESTINO/${BD}_${FECHA}_filestore.tar.gz" -C "$FILESTORE" "$BD"  # adjuntos de esa BD
  fi
done

find "$DESTINO" -type f \( -name '*.dump' -o -name '*.tar.gz' \) -mtime +$((DIAS - 1)) -delete   # rotación
echo "$(date '+%F %T') copia correcta de: $(ls "$DESTINO" | grep -c "$FECHA") ficheros" >> "$DESTINO/backup.log"
