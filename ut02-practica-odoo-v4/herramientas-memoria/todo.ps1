$ErrorActionPreference = 'Stop'
# Genera las dos memorias de la v4 (completa y resumida) en .docx, .odt y .pdf.
#  - construir.py   : python-docx (contenido_v4.py + pies.py) -> .docx
#  - convertir_oo.py: OpenOffice 4 por UNO (.docx -> .odt con indice actualizado -> .pdf)
#  - arreglar_odt.py: quita marcos duplicados y la numeracion automatica de capitulos del .odt
$P = 'C:\dev\Sistemas-Gestion-Empresarial\ut02-practica-odoo-v4'
$oo = 'C:\Program Files (x86)\OpenOffice 4\program\python.exe'
$env:PYTHONIOENCODING = 'utf-8'
foreach ($m in @(@('completa', 'completa'), @('corta', 'resumida'))) {
  $b = "$P\ut02-practica4-cerveceria-odoo17-joseantonio-pastor-$($m[1])"
  python "$PSScriptRoot\construir.py" "$P\capturas" "$P\logo-cerveceria-springfield.png" "$b.docx" $m[0]
  Get-Process soffice* -ErrorAction SilentlyContinue | Stop-Process -Force
  & $oo "$PSScriptRoot\convertir_oo.py" odt "$b.docx" "$b.odt" "$b.pdf"
  Start-Sleep 3; Get-Process soffice* -ErrorAction SilentlyContinue | Stop-Process -Force
  python "$PSScriptRoot\arreglar_odt.py" "$b.odt"
  & $oo "$PSScriptRoot\convertir_oo.py" pdf "$b.docx" "$b.odt" "$b.pdf"
  Start-Sleep 3; Get-Process soffice* -ErrorAction SilentlyContinue | Stop-Process -Force
}
Get-ChildItem "$P\ut02-practica4-*" | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}
