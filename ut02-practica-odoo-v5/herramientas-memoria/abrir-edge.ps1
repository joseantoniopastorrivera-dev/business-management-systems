# Abre un Edge SOLO para la v5: puerto CDP de config.json (9223) y perfil propio en %LOCALAPPDATA%.
# Así convive con el Edge de la v4 (puerto 9222) y con tu Edge normal sin mezclar sesiones de Odoo.
# La primera vez tendrás que iniciar sesión en Odoo en esa ventana (la contraseña la escribes tú).
$cfg    = Get-Content "$PSScriptRoot\config.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$perfil = Join-Path $env:LOCALAPPDATA 'edge-odoo-v5'
$url    = "$($cfg.odoo)/web/login?db=$($cfg.bd)"
Start-Process $cfg.edge -ArgumentList "--remote-debugging-port=$($cfg.cdpPuerto)", "--user-data-dir=`"$perfil`"", '--no-first-run', '--window-size=1400,950', $url
"Edge de la v5 en el puerto $($cfg.cdpPuerto) (perfil $perfil) -> $url"
