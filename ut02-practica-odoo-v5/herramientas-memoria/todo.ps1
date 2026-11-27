param([switch]$Borrador)
$ErrorActionPreference = 'Stop'
# Genera las dos memorias de la v5 (completa y resumida): .docx, .odt y .pdf.
#   comprobar.py     : antes de nada, que manifiesto, capturas y pies estén bien (para si hay errores)
#   construir.py     : python-docx (contenido_v5.py + capturas.json) -> .docx
#   convertir_oo.py  : OpenOffice 4 por UNO, con perfil y puerto propios (.docx -> .odt -> .pdf)
#   arreglar_odt.py  : quita marcos duplicados y la numeración automática de capítulos del .odt
# Uso: .\todo.ps1            (definitivo: exige todos los pies revisados)
#      .\todo.ps1 -Borrador  (deja pasar pies sin revisar, marcados con [BORRADOR])
$cfg  = Get-Content "$PSScriptRoot\config.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$raiz = Split-Path $PSScriptRoot -Parent
$oo   = Join-Path $cfg.openoffice 'python.exe'
$env:OO_DIR = $cfg.openoffice
$env:PYTHONIOENCODING = 'utf-8'
$extra = @(); if ($Borrador) { $extra = @('--borrador') }

python "$PSScriptRoot\comprobar.py" @extra
if ($LASTEXITCODE -ne 0) { throw 'comprobar.py ha encontrado errores: corrígelos antes de generar' }

foreach ($modo in 'completa', 'resumida') {
  $b = Join-Path $raiz "$($cfg.salida)-$modo"
  python "$PSScriptRoot\construir.py" $modo @extra
  if ($LASTEXITCODE -ne 0) { throw "construir.py ha fallado ($modo)" }
  & $oo "$PSScriptRoot\convertir_oo.py" odt "$b.docx" "$b.odt" "$b.pdf"
  if ($LASTEXITCODE -ne 0) { throw "OpenOffice: .docx -> .odt ha fallado ($modo)" }
  python "$PSScriptRoot\arreglar_odt.py" "$b.odt"
  if ($LASTEXITCODE -ne 0) { throw "arreglar_odt.py ha fallado ($modo)" }
  & $oo "$PSScriptRoot\convertir_oo.py" pdf "$b.docx" "$b.odt" "$b.pdf"
  if ($LASTEXITCODE -ne 0) { throw "OpenOffice: .odt -> .pdf ha fallado ($modo)" }
}
Get-ChildItem (Join-Path $raiz "$($cfg.salida)-*") | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}
