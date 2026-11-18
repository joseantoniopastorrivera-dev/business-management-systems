# Índice de capturas · Práctica 3 Odoo (autoescuela)

| Nº | Archivo | Qué se ve | Apartado del enunciado |
|---|---|---|---|
| 001 | 001-ubuntu-ip-ssh-activo-y-habilitado-ufw-inactivo.png | IP 192.168.1.132, ssh.service active y enabled, ufw inactive (puerto 22 abierto) | Consideraciones: SSH y firewall |
| 002 | 002-ubuntu-servicio-odoo-activo.png | odoo.service active (running) con --dev=all, config /home/odoo/conf/odoo-server.conf | Preparación del entorno |
| 003 | 003-scaffold-esqueleto-autoescuela-en-addons.png | su - odoo y odoo-bin scaffold autoescuela en /home/odoo/odoo/addons; árbol generado | Ejercicio 2 y 3: esqueleto en addons |
| 004 | 004-github-formulario-repo-autoescuela-sin-readme.png | Formulario de nuevo repo: autoescuela, público, sin README, sin .gitignore ni licencia | Ejercicio 4: repositorio en GitHub |
| 005 | 005-github-repo-autoescuela-creado-vacio.png | Repo joseantoniopastorrivera-dev/autoescuela creado y vacío (Quick setup) | Ejercicio 4 |
| 006 | 006-github-fine-grained-tokens-sin-tokens.png | Settings > Developer settings > Fine-grained tokens (vacío): se crea un token para hacer push desde la VM | Ejercicio 4: autenticación para subir el esqueleto |
| 007 | 007-github-token-solo-repo-autoescuela-contents-read-write.png | Token fine-grained limitado al repo autoescuela con Contents: Read and write (mínimo privilegio) | Ejercicio 4 |
| 008 | 008-git-init-commit-esqueleto-y-push-a-main.png | git init, identidad (email noreply), commit del esqueleto y push a main (token no visible) | Ejercicio 4: subir el esqueleto |
| 009 | 009-github-repo-con-esqueleto-en-main.png | Repo autoescuela en GitHub con el esqueleto en main (1 commit, rama main creada) | Ejercicio 4 |
| 010 | 010-github-anadir-colaboradora-tawnyswine.png | Settings > Collaborators > Add people: se selecciona TawnySwine | Ejercicio 4: colaboradores |
| 011 | 011-github-invitacion-tawnyswine-pendiente.png | Invitación enviada a TawnySwine (Pending Invite) | Ejercicio 4: colaboradores |
| 012 | 012-ramas-develop-feature-dev-feature-tawnyswine.png | Ramas develop (desde main), feature/dev y feature/tawnyswine (desde develop) creadas y subidas; git branch -a | Ejercicio 4: ramas por miembro |
| 013 | 013-tawnyswine-notificacion-invitacion.png | Sesión de TawnySwine (incógnito): notificación de la invitación a autoescuela | Ejercicio 4: colaboradores |
| 014 | 014-tawnyswine-pagina-aceptar-invitacion.png | TawnySwine ve la invitación de joseantoniopastorrivera-dev con Accept invitation | Ejercicio 4: colaboradores |
| 015 | 015-tawnyswine-acceso-push-concedido-4-ramas.png | TawnySwine ya tiene push access; el repo muestra 4 ramas | Ejercicio 4: colaboradores |
| 016 | 016-windows-descarga-instalador-vscode-y-lanzamiento.png | PowerShell en la VM Windows: descarga del instalador de VS Code (copiado desde el portátil por la red local) y lanzamiento de la instalación | Ejercicio 3: VS Code en Windows |
| 017 | 017-windows-instalador-vscode-en-curso.png | Instalador de Visual Studio Code (User) en curso | Ejercicio 3: VS Code en Windows |
| 018 | 018-windows-instalando-vscode-progreso.png | Instalador de VS Code extrayendo archivos (barra de progreso) | Ejercicio 3: VS Code en Windows |
| 019 | 019-windows-vscode-instalado.png | Instalación de VS Code terminada (mensaje VS Code instalado) | Ejercicio 3: VS Code en Windows |
| 020 | 020-windows-vscode-version-y-extension-remote-ssh.png | code --version (1.147.0) e instalación de la extensión Remote - SSH (con remote-ssh-edit y remote-explorer) | Ejercicio 3: VS Code + Remote-SSH |
| 021 | 021-vscode-remote-ssh-pide-contrasena-odoo.png | VS Code conectando por Remote-SSH a odoo@192.168.1.132: pide la contraseña e inicializa VS Code Server | Ejercicio 3: conexión remota por SSH |
| 022 | 022-incidencia-vscode-server-descarga-lenta.png | Incidencia: VS Code se queda en Downloading VS Code Server (descarga muy lenta desde la VM) y los comandos de Remote-SSH aún no están disponibles | Incidencias |
| 023 | 023-solucion-vscode-server-copiado-desde-portatil.png | Solución: el servidor de VS Code (mismo commit) se descarga en el portátil y se copia a ~/.vscode-server por la red local; bin/code-server presente | Incidencias / Ejercicio 3 |
| 024 | 024-vscode-remote-ssh-plataforma-linux.png | Remote-SSH pregunta la plataforma del host 192.168.1.132: Linux | Ejercicio 3: conexión remota por SSH |
| 025 | 025-incidencia-vscode-failed-to-parse-remote-port.png | Incidencia: Remote-SSH falla con Failed to parse remote port from server output (proceso de la descarga anterior colgado) | Incidencias |
| 026 | 026-solucion-pkill-vscode-server-y-version.png | Solución: pkill -f vscode-server y comprobación del servidor copiado (code-server 1.147.0, commit 8a14f0cc) | Incidencias |
| 027 | 027-vscode-conectado-ssh-explorador-autoescuela.png | VS Code en Windows conectado por SSH a 192.168.1.132: explorador con el esqueleto de autoescuela, rama feature/dev | Ejercicio 3: desarrollo remoto con VS Code |
| 028 | 028-vscode-terminal-remoto-whoami-pwd-ramas.png | Terminal integrado de VS Code (bash remoto): usuario odoo, carpeta /home/odoo/odoo/addons/autoescuela, IP 192.168.1.132, ramas y commit inicial | Ejercicio 3: desarrollo remoto con VS Code |
| 029 | 029-vscode-git-pull-v0-1.png | git pull en el terminal remoto de VS Code: llega la v0.1 (modelos, secuencia y seguridad; se quitan controllers, demo y vistas de ejemplo) | Ejercicio 4: control de versiones / Ejercicio 7 |
| 030 | 030-vscode-models-py-cabecera.png | models.py abierto en VS Code remoto: imports, ayuda del carnet y nombre de la tabla intermedia compartida | Ejercicio 7: modelos |
| 031 | 031-vscode-models-py-examen-secuencia.png | Clase Examen en models.py: moneda, precio Monetary, carnet con ayuda y create() con la secuencia | Ejercicio 7 y 10.iv: secuencia |
| 032 | 032-odoo-actualizar-lista-aplicaciones.png | Odoo en modo desarrollador (BD test): Aplicaciones > Actualizar lista de aplicaciones | Ejercicio 7: instalar el módulo |
| 033 | 033-odoo-app-autoescuela-sin-instalar.png | La aplicación Autoescuela aparece en Aplicaciones tras actualizar la lista (aún con icono genérico, sin vistas) | Ejercicio 7: instalar el módulo |
| 034 | 034-odoo-ajustes-tecnico-modelos-autoescuela.png | Ajustes > Técnico > Modelos filtrado por autoescuela: los 4 modelos creados por el ORM | Ejercicio 7.a: comprobación en la interfaz |
| 035 | 035-odoo-grupos-autoescuela-gestor-director.png | Ajustes > Usuarios y compañías > Grupos filtrado por Autoescuela: Director y Gestor | Ejercicio 8: perfiles de seguridad |
| 036 | 036-odoo-grupo-gestor-usuarios.png | Grupo Autoescuela / Gestor, pestaña Usuarios: Mitchell Admin (admin) pertenece al grupo | Ejercicio 8.a.i: Gestor |
| 037 | 037-odoo-grupo-gestor-permisos-acceso.png | Gestor, Permisos de acceso: CRUD completo en examen, alumno y profesor; solo lectura en autoescuela | Ejercicio 8.a.i: Gestor |
| 038 | 038-odoo-grupo-director-usuarios.png | Grupo Autoescuela / Director, pestaña Usuarios: Mitchell Admin también pertenece | Ejercicio 8.a.ii: Director |
| 039 | 039-odoo-grupo-director-hereda-gestor.png | Director, pestaña Heredado: hereda el grupo Autoescuela / Gestor (implied_ids) | Ejercicio 8.a.ii: Director |
| 040 | 040-odoo-grupo-director-permisos-acceso.png | Director, Permisos de acceso: CRUD completo en autoescuela (más los heredados de Gestor) | Ejercicio 8.a.ii: Director |
| 041 | 041-psql-dt-tablas-autoescuela.png | psql -d test -c '\dt autoescuela*': 5 tablas, con UNA sola tabla intermedia compartida autoescuela_autoescuela_examen_rel | Ejercicio 7.c: comprobación con psql |
| 042 | 042-incidencia-pgadmin-connection-timeout.png | Incidencia: pgAdmin no conecta (connection timeout expired): el servidor guardado apunta a la IP de otra red | Incidencias |
| 043 | 043-solucion-pgadmin-host-192-168-1-132.png | Solución: Properties > Connection del servidor Odoo Ubuntu - odoo con Host = 192.168.1.132, puerto 5432, usuario odoo | Incidencias / Ejercicio 7.b |
| 044 | 044-pgadmin-tablas-autoescuela-en-test.png | pgAdmin 4 > Odoo Ubuntu - odoo > test > public > Tables: las 5 tablas autoescuela_* creadas por el ORM | Ejercicio 7.b: comprobación con pgAdmin |
| 045 | 045-pgadmin-search-objects-autoescuela.png | pgAdmin Search Objects en test con tipo Tables: 5 coincidencias autoescuela_* con su ruta Schemas/public/Tables | Ejercicio 7.b: comprobación con pgAdmin |
| 046 | 046-psql-usuario-postgres-l-connect-dt.png | psql como usuario postgres: \l (bases de datos), \connect test y \dt autoescuela* con las 5 tablas | Ejercicio 7.c: comprobación con psql (usuario postgres) |
| 047 | 047-vscode-git-pull-v0-2-vistas-menus-icono.png | git pull de la v0.2: vistas de los 4 modelos, menús e icono static/description/icon.png | Ejercicios 9 y 10: menús y vistas |
| 048 | 048-vscode-autoescuela-menus-xml.png | autoescuela_menus.xml en VS Code: menú raíz Autoescuela con web_icon y submenús con sus acciones | Ejercicio 9: menús |
| 049 | 049-odoo-desinstalar-autoescuela-para-icono.png | Desinstalar módulo Autoescuela (sin registros) para que al reinstalar se cargue el icono del menú raíz | Ejercicio 9.a: icono |
| 050 | 050-solucion-reinicio-servicio-odoo-icono.png | Incidencia y solución: el icono daba 404 porque Odoo registra las carpetas static al arrancar; sudo systemctl restart odoo | Incidencias / Ejercicio 9.a |
| 051 | 051-odoo-app-autoescuela-con-icono-activar.png | Aplicaciones: Autoescuela ya muestra su icono (placa L de prácticas) antes de activarla | Ejercicio 9.a: icono |
| 052 | 052-odoo-app-autoescuela-instalada-con-icono.png | Autoescuela instalada (botón Aprenda más) con su icono, como en el enunciado | Ejercicio 9.a: icono |
| 053 | 053-odoo-menu-aplicaciones-autoescuela.png | Menú de aplicaciones de Odoo con la entrada Autoescuela | Ejercicio 9: menús |
| 054 | 054-odoo-menu-autoescuela-4-submenus.png | App Autoescuela: menú raíz con los submenús Autoescuelas, Profesores, Alumnos y Exámenes por Alumno (lista vacía) | Ejercicio 9: menús |
| 055 | 055-odoo-empresa-yourcompany-antes.png | Perfil de la empresa antes de configurar: YourCompany con los datos de ejemplo | Ejercicio 5: perfil de empresa |
| 056 | 056-odoo-empresa-autoescuela-complutum-guardada.png | Perfil de empresa configurado y guardado: Autoescuela Complutum, Calle Mayor 15, 28801 Alcalá de Henares (Madrid), teléfono, correo, web y logo | Ejercicio 5: perfil de empresa |
| 057 | 057-odoo-autoescuela-form-nuevo-vacio.png | Formulario nuevo de Autoescuela: información general, exámenes, alumnos matriculados y profesores asignados | Ejercicio 10.ii: vista form autoescuela |
| 058 | 058-odoo-autoescuela-complutum-centro-rellena.png | Alta de la autoescuela Complutum Centro (Calle Mayor 15, Alcalá de Henares, Madrid, 918880101) | Ejercicio 10.ii: vista form autoescuela |
| 059 | 059-odoo-examen-nuevo-codigo-autogenerado.png | Nuevo examen: el Código del Examen es de solo lectura y vale Autogenerado; moneda EUR por defecto; historial (mail.thread) a la derecha | Ejercicio 10.iv.f: secuencia |
| 060 | 060-odoo-examen-ayuda-tipo-carnet.png | Campo Tipo de Carnet (Char) con su help: valores recomendados AM, A1, A2, A y B | Ejercicio 7.d.viii: carnet con help |
| 061 | 061-odoo-examen-anadir-autoescuelas-asociadas.png | Many2many: se asocian al examen las dos autoescuelas de la red (Centro y Espartales) | Ejercicio 7.d.iii: autoescuela_ids |
| 062 | 062-odoo-examen-relleno-antes-de-guardar.png | Examen relleno antes de guardar: 20/11/2026, 94,05 €, 25 clases, carnet B, aprobado, alumno Pablo García Rubio; el código sigue Autogenerado | Ejercicio 10.iii: vista form examen |
| 063 | 063-odoo-examen-guardado-sge00001.png | Al guardar, la secuencia genera el código SGE00001; la miga de pan muestra Código Examen: SGE00001 - Carnet: B (_compute_display_name) | Ejercicio 10.iv.g: secuencia |
| 064 | 064-odoo-examenes-tree-agrupado-por-carnet.png | Vista tree de exámenes con el filtro Carnet activado por defecto (agrupa A2 y B, con totales de precio y clases) | Ejercicio 10.iii: tree y filtro por carnet |
| 065 | 065-odoo-examenes-calendario-noviembre.png | Vista calendar de exámenes (noviembre 2026): cada examen en su fecha con el texto Código Examen: ... - Carnet: ... | Ejercicio 10.iii: calendar |
| 066 | 066-odoo-examenes-calendario-detalle-sge00001.png | Detalle en el calendario: Código Examen: SGE00001 - Carnet: B, alumno y aprobado | Ejercicio 10.iii: calendar (texto personalizado) |
| 067 | 067-odoo-autoescuelas-tree.png | Vista tree de autoescuelas: Complutum Centro y Complutum Espartales con exámenes, alumnos y profesores | Ejercicio 10.ii: tree autoescuela |
| 068 | 068-odoo-autoescuela-form-centro-relaciones.png | Form de Complutum Centro: los exámenes asociados desde el examen aparecen aquí (Many2many con tabla compartida), alumnos y profesores (One2many) | Ejercicio 10.ii: form autoescuela |
| 069 | 069-odoo-profesores-tree-antiguedad.png | Vista tree de profesores con la antigüedad calculada (4, 7 y 9 años desde la incorporación) | Ejercicio 10.v: tree profesor |
| 070 | 070-odoo-profesor-form-marta.png | Form de la profesora Marta López Herranz: antigüedad 9 (campo calculado, solo lectura) y sus alumnos (One2many) | Ejercicio 10.v: form profesor |
| 071 | 071-odoo-alumnos-tree.png | Vista tree de alumnos: DNI, domicilio, número de matrícula, autoescuela, profesor habitual y exámenes | Ejercicio 10.i: tree alumno |
| 072 | 072-odoo-alumno-form-pablo.png | Form del alumno Pablo García Rubio con su examen SGE00001 | Ejercicio 10.i: form alumno |
| 073 | 073-vscode-git-pull-v0-3-informes-html.png | git pull de la v0.3: carpeta reports con los 4 informes; autoescuela_examen_report.xml con report_type qweb-html | Ejercicio 11: informes |
| 074 | 074-odoo-actualizar-modulo-autoescuela.png | Menú del módulo Autoescuela > Actualizar: carga los cambios de una nueva versión sin perder datos | Ejercicio 11: informes |
| 075 | 075-ssh-reinicio-odoo-v0-3.png | sudo systemctl restart odoo: Odoo cachea el manifiesto y hay que reiniciar para que vea los informes nuevos | Ejercicio 11: informes |
| 076 | 076-odoo-menu-imprimir-informe-alumno.png | Tras reiniciar y actualizar (v17.0.0.3.0) el menú Acciones del alumno ya muestra Informe de alumno | Ejercicio 11: informes |
| 077 | 077-odoo-informe-alumno-html.png | Informe de alumno en HTML: cabecera con logo y dirección de Autoescuela Complutum (external_layout), datos del alumno y tabla de exámenes | Ejercicio 11: informes |
| 078 | 078-odoo-informe-autoescuela-html.png | Informe de autoescuela en HTML (Complutum Centro) con sus exámenes | Ejercicio 11: informes |
| 079 | 079-odoo-informe-profesor-html.png | Informe de profesor en HTML: incluye la antigüedad calculada (4 años) | Ejercicio 11: informes |
| 080 | 080-odoo-informe-examen-html.png | Informe de examen en HTML (SGE00001) con alumno, precio, carnet y autoescuelas asociadas | Ejercicio 11: informes |
| 081 | 081-vscode-git-pull-v0-4-informes-pdf.png | git pull de la v0.4: los 4 informes pasan a report_type qweb-pdf y la versión a 17.0.0.4.0 | Ejercicio 11: informes |
| 082 | 082-odoo-informe-alumno-pdf.png | Informe de alumno ya en PDF (qweb-pdf, generado por wkhtmltopdf) abierto en el visor de Chrome | Ejercicio 11: informes |
| 083 | 083-odoo-informe-autoescuela-pdf.png | Informe de autoescuela en PDF (Complutum Centro) | Ejercicio 11: informes |
| 084 | 084-odoo-informe-profesor-pdf.png | Informe de profesor en PDF (Javier Ruiz Gómez) | Ejercicio 11: informes |
| 085 | 085-odoo-informe-examen-pdf.png | Informe de examen en PDF (SGE00001) | Ejercicio 11: informes |
| 086 | 086-chrome-descarga-pdf-bloqueada-http.png | Chrome bloquea las descargas de un sitio HTTP sin cifrar: hay que pulsar Conservar; abajo, el PDF del informe de alumno ya descargado | Ejercicio 11: informes |
| 087 | 087-pdf-informe-alumno-descargado.png | Página completa del PDF descargado (Informe de alumno - Pablo García Rubio.pdf) | Ejercicio 11: informes |
| 088 | 088-vscode-git-pull-v0-5-restricciones-sql.png | git pull de la v0.5: _sql_constraints UNIQUE(dni) en Profesor y UNIQUE(matricula) en Alumno | Ejercicio 12: restricciones SQL |
| 089 | 089-ssh-reinicio-odoo-v0-5.png | sudo systemctl restart odoo: necesario porque la v0.5 cambia código Python (models.py) | Ejercicio 12: restricciones SQL |
| 090 | 090-odoo-modulo-version-0-5.png | Tras reiniciar y actualizar, Información del módulo ya muestra la versión 17.0.0.5.0 | Ejercicio 12: restricciones SQL |
| 091 | 091-odoo-alumno-matricula-repetida.png | Nuevo alumno de prueba con la matrícula 1001, que ya tiene Pablo García Rubio | Ejercicio 12: restricciones SQL |
| 092 | 092-odoo-error-matricula-duplicada.png | Al guardar, PostgreSQL rechaza el INSERT por UNIQUE(matricula) y Odoo muestra el mensaje de la restricción | Ejercicio 12: restricciones SQL |
| 093 | 093-odoo-error-dni-profesor-duplicado.png | Profesor de prueba con el DNI 50123456A de Laura Martín Sanz: la restricción UNIQUE(dni) impide guardarlo | Ejercicio 12: restricciones SQL |
| 094 | 094-pgadmin-query-restricciones-unique.png | pgAdmin Query Tool sobre pg_constraint: UNIQUE(dni) en autoescuela_profesor y UNIQUE(matricula) en autoescuela_alumno creadas por _sql_constraints | Ejercicio 12: restricciones SQL |
| 095 | 095-incidencia-pgadmin-constraints-vacio.png | Incidencia: en el árbol de pgAdmin la carpeta Constraints de autoescuela_alumno sale vacía aunque se refresque (la conexión del Object Explorer había caducado); la consulta del Query Tool sí muestra las restricciones | Incidencias / Ejercicio 12 |
| 096 | 096-pgadmin-constraints-autoescuela-alumno.png | Tras reconectar el servidor en el árbol: Constraints (6) de autoescuela_alumno, con la UNIQUE autoescuela_alumno_matricula_alumno_unica, la clave primaria y las 4 claves ajenas | Ejercicio 12: restricciones SQL |
| 097 | 097-pgadmin-constraints-autoescuela-profesor.png | Constraints (5) de autoescuela_profesor: la UNIQUE autoescuela_profesor_dni_profesor_unico, la clave primaria y 3 claves ajenas | Ejercicio 12: restricciones SQL |
| 098 | 098-pgadmin-query-todas-restricciones.png | Primera consulta sobre pg_constraint: las 11 restricciones de autoescuela_alumno y autoescuela_profesor con su tipo (f = clave ajena, u = unique, p = clave primaria) | Ejercicio 12: restricciones SQL |
| 099 | 099-odoo-alumnos-importar-registros.png | Alumnos > Acciones > Importar registros | Ejercicio adicional 1: importar xlsx |
| 100 | 100-odoo-importar-subir-archivo.png | Pantalla de importación: Subir archivo (Excel o CSV) | Ejercicio adicional 1: importar xlsx |
| 101 | 101-odoo-error-importar-xlsx-openpyxl.png | Error al subir alumnos-complutum.xlsx: Odoo 17 requiere el módulo de Python openpyxl | Ejercicio adicional 1: importar xlsx |
| 102 | 102-python-excel-org-openpyxl.png | python-excel.org: openpyxl es el paquete para leer y escribir Excel 2010 (.xlsx) | Ejercicio adicional 1: importar xlsx |
| 103 | 103-python-excel-org-xlrd.png | python-excel.org: xlrd solo lee los Excel antiguos (.xls) | Ejercicio adicional 1: importar xlsx |
| 104 | 104-pypi-xlrd.png | PyPI de xlrd: comando pip install xlrd (solo para .xls) | Ejercicio adicional 1: importar xlsx |
| 105 | 105-pypi-openpyxl.png | PyPI de openpyxl: librería para leer y escribir .xlsx | Ejercicio adicional 1: importar xlsx |
| 106 | 106-vscode-pip-install-xlrd-externally-managed.png | pip install xlrd en el terminal remoto de VS Code: Ubuntu 24 lo impide (externally-managed-environment, PEP 668) y recomienda apt install python3-xyz | Ejercicio adicional 1: importar xlsx |
| 107 | 107-ssh-apt-install-python3-xlrd.png | sudo apt install python3-xlrd: ya está en su versión más reciente (2.0.1-2), igual que en el enunciado; xlrd no sirve para .xlsx | Ejercicio adicional 1: importar xlsx |
| 108 | 108-ssh-apt-install-python3-openpyxl.png | sudo apt install python3-openpyxl: instala python3-openpyxl 3.1.2 y su dependencia python3-et-xmlfile | Ejercicio adicional 1: importar xlsx |
| 109 | 109-ssh-reinicio-odoo-openpyxl.png | Reinicio del servicio odoo tras instalar python3-openpyxl | Ejercicio adicional 1: importar xlsx |
| 110 | 110-excel-alumnos-complutum-xlsx.png | Contenido del fichero alumnos-complutum.xlsx: 4 alumnos nuevos con autoescuela y profesor por nombre | Ejercicio adicional 1: importar xlsx |
| 111 | 111-odoo-importar-xlsx-mapeo-columnas.png | Con openpyxl instalado ya no hay error: Odoo lee la hoja Alumnos y asocia cada columna con su campo | Ejercicio adicional 1: importar xlsx |
| 112 | 112-odoo-importar-xlsx-prueba-valida.png | Botón Prueba: Todo parece válido (las Many2one Autoescuela y Profesor se resuelven por nombre) | Ejercicio adicional 1: importar xlsx |
| 113 | 113-odoo-importar-xlsx-4-registros.png | Importar: 4 registros importados con éxito | Ejercicio adicional 1: importar xlsx |
| 114 | 114-odoo-alumnos-tras-importar.png | Lista de Alumnos con los 8 alumnos: los 4 importados desde Excel aparecen con su autoescuela y profesor | Ejercicio adicional 1: importar xlsx |
| 115 | 115-vscode-git-pull-v1-0-many2many-tags.png | git pull de la v1.0: widget many2many_tags en los 12 campos relacionales de las vistas form y tree | Ejercicio adicional 2: many2many_tags |
| 116 | 116-odoo-autoescuelas-tree-many2many-tags.png | Autoescuelas (tree): exámenes, alumnos y profesores como etiquetas many2many_tags | Ejercicio adicional 2: many2many_tags |
| 117 | 117-odoo-autoescuela-form-many2many-tags.png | Autoescuela Complutum Centro (form): exámenes, alumnos y profesores como etiquetas | Ejercicio adicional 2: many2many_tags |
| 118 | 118-odoo-alumnos-tree-many2many-tags.png | Alumnos (tree): exámenes de cada alumno como etiquetas | Ejercicio adicional 2: many2many_tags |
| 119 | 119-odoo-alumno-form-many2many-tags.png | Alumno Pablo García Rubio (form): su examen como etiqueta | Ejercicio adicional 2: many2many_tags |
| 120 | 120-odoo-examenes-tree-many2many-tags.png | Exámenes por Alumno (tree, agrupado por carnet): autoescuelas asociadas como etiquetas | Ejercicio adicional 2: many2many_tags |
| 121 | 121-odoo-examen-form-many2many-tags.png | Examen SGE00001 (form): las dos autoescuelas asociadas como etiquetas | Ejercicio adicional 2: many2many_tags |
| 122 | 122-odoo-profesores-tree-many2many-tags.png | Profesores (tree): alumnos de cada profesor como etiquetas | Ejercicio adicional 2: many2many_tags |
| 123 | 123-odoo-profesor-form-many2many-tags.png | Profesora Marta López Herranz (form): sus 4 alumnos como etiquetas | Ejercicio adicional 2: many2many_tags |
| 124 | 124-github-compare-develop-feature-dev.png | GitHub: comparación develop ← feature/dev, Able to merge, 6 commits (v0.1 a v1.0) y 22 archivos | GitHub: pull requests |
| 125 | 125-github-nueva-pr-feature-dev-develop.png | Nueva pull request develop ← feature/dev con título y descripción de las versiones v0.1 a v1.0 | GitHub: pull requests |
| 126 | 126-github-pr1-abierta.png | Pull request #1 abierta: joseantoniopastorrivera-dev quiere fusionar 6 commits de feature/dev en develop | GitHub: pull requests |
| 127 | 127-github-tawnyswine-revision-pr1-approve.png | TawnySwine (incógnito, avatar morado) revisa la PR #1: Files changed > Submit review con comentario y opción Approve | GitHub: pull requests |
| 128 | 128-github-tawnyswine-aprueba-pr1.png | TawnySwine (Collaborator) aprueba la PR #1: approved these changes con su comentario de revisión | GitHub: pull requests |
| 129 | 129-github-tawnyswine-crea-readme.png | TawnySwine crea README.md en su rama feature/tawnyswine desde el editor web de GitHub | GitHub: pull requests |
| 130 | 130-github-tawnyswine-commit-readme.png | Commit changes: mensaje Añade el README del módulo autoescuela, directamente en la rama feature/tawnyswine | GitHub: pull requests |
| 131 | 131-github-tawnyswine-commit-en-su-rama.png | Commit de TawnySwine en feature/tawnyswine (6c766e5): README.md añadido; GitHub ofrece Compare & pull request | GitHub: pull requests |
| 132 | 132-github-tawnyswine-nueva-pr-develop.png | TawnySwine prepara su pull request develop ← feature/tawnyswine: Able to merge, 1 commit, 1 archivo | GitHub: pull requests |
| 133 | 133-github-pr2-tawnyswine-abierta.png | Pull request #2 abierta por TawnySwine: fusionar 1 commit (Verified) de feature/tawnyswine en develop | GitHub: pull requests |
| 134 | 134-github-pr1-lista-para-merge.png | PR #1: Changes reviewed (1 approval de TawnySwine) y No conflicts with base branch: lista para Merge pull request | GitHub: pull requests |
| 135 | 135-github-pr1-confirm-merge.png | Confirm merge de la PR #1: el commit de merge se firma con el email privado noreply de GitHub | GitHub: pull requests |
| 136 | 136-github-pr1-merged.png | PR #1 Merged: commit a16443d fusionado en develop; Pull request successfully merged and closed | GitHub: pull requests |
| 137 | 137-github-pr2-aprobada-y-merged.png | PR #2 de TawnySwine: aprobada por joseantoniopastorrivera-dev (Owner) y fusionada en develop (commit d772567) | GitHub: pull requests |
| 138 | 138-github-nueva-pr-develop-main.png | Nueva pull request main ← develop: Able to merge, versión estable 1.0 que integra las PR #1 y #2 | GitHub: pull requests |
| 139 | 139-github-pr3-develop-main-abierta.png | Pull request #3 abierta: fusionar los 9 commits de develop en main (enlaza las PR #1 y #2) | GitHub: pull requests |
| 140 | 140-github-tawnyswine-revision-pr3.png | TawnySwine revisa la PR #3 (develop → main) con Approve antes de pasar a main | GitHub: pull requests |
| 141 | 141-github-pr3-aprobada-tawnyswine.png | PR #3: los 9 commits (6 de -dev, el README de TawnySwine y los dos merges) y la aprobación de TawnySwine | GitHub: pull requests |
| 142 | 142-github-pr3-merged-main.png | PR #3 Merged: develop fusionada en main (commit 218dcb8) tras la aprobación de TawnySwine | GitHub: pull requests |
| 143 | 143-github-main-version-final.png | Rama main con la versión 1.0 completa y el README; Contributors: joseantoniopastorrivera-dev y TawnySwine | GitHub: pull requests |
| 144 | 144-github-network-graph-ramas.png | Insights > Network: feature/dev y feature/tawnyswine se integran en develop y develop en main | GitHub: pull requests |
| 145 | 145-github-tres-pr-merged-approved.png | Las 3 pull requests cerradas, fusionadas y aprobadas: #1 y #3 de -dev (Owner) y #2 de TawnySwine (Collaborator) | GitHub: pull requests |
| 146 | 146-virtualbox-mac-distintas-adaptador-puente.png | VBoxManage en el portátil: las dos VMs usan adaptador puente con MAC distintas (Ubuntu 08:00:27:18:26:D8, Windows 08:00:27:1B:A8:C0) | Consideraciones: MAC distinta |
