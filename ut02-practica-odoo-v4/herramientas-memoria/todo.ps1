$ErrorActionPreference = 'Stop'
# Genera las dos memorias de la v4 (completa y resumida) en .docx, .odt y .pdf.
#  - construir.py   : python-docx (contenido_v4.py + pies.py) -> .docx
#  - convertir_oo.py: OpenOffice 4 por UNO (.docx -> .odt con indice actualizado -> .pdf)
#  - arreglar_odt.py: quita marcos duplicados y la numeracion automatica de capitulos del .odt
# Las rutas (capturas, logo, salida, python de OpenOffice) estan en config.json.
$cfg = Get-Content "$PSScriptRoot\config.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$base = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $cfg.salida))
$oo = $cfg.openoffice_python
$env:PYTHONIOENCODING = 'utf-8'

foreach ($m in @(@('completa', 'completa'), @('corta', 'resumida'))) {
  $b = "$base-$($m[1])"
  python "$PSScriptRoot\construir.py" "$b.docx" $m[0]
  if ($LASTEXITCODE) { throw "construir.py ha fallado ($($m[1]))" }
  Get-Process soffice* -ErrorAction SilentlyContinue | Stop-Process -Force
  & $oo "$PSScriptRoot\convertir_oo.py" odt "$b.docx" "$b.odt" "$b.pdf"
  Start-Sleep 3; Get-Process soffice* -ErrorAction SilentlyContinue | Stop-Process -Force
  if ($LASTEXITCODE) { throw "convertir_oo.py odt ha fallado ($($m[1]))" }
  python "$PSScriptRoot\arreglar_odt.py" "$b.odt"
  & $oo "$PSScriptRoot\convertir_oo.py" pdf "$b.docx" "$b.odt" "$b.pdf"
  Start-Sleep 3; Get-Process soffice* -ErrorAction SilentlyContinue | Stop-Process -Force
  if ($LASTEXITCODE) { throw "convertir_oo.py pdf ha fallado ($($m[1]))" }
}
Get-ChildItem "$base-*" | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}
