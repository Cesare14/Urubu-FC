# build.ps1 — Urubu FC
# Gera dist/index.html a partir dos arquivos em src/
# Uso: .\build.ps1  (rodar na pasta raiz do projeto, onde este arquivo está)

$ErrorActionPreference = "Stop"

$SRC = "src"
$OUT = "dist\index.html"
New-Item -ItemType Directory -Force -Path "dist" | Out-Null

# Ordem de concatenação dos JS
$JS_FILES = @(
  "$SRC\js\config.js"
  "$SRC\js\state.js"
  "$SRC\js\ui.js"
  "$SRC\js\field.js"
  "$SRC\js\roster.js"
  "$SRC\js\market.js"
  "$SRC\js\analysis.js"
  "$SRC\js\share.js"
  "$SRC\js\app.js"
  "$SRC\js\legal.js"
)

$enc = [System.Text.Encoding]::UTF8
$writer = [System.IO.StreamWriter]::new($OUT, $false, $enc)

# 1. <head> + CSS inline
$writer.WriteLine((Get-Content "$SRC\head.html" -Raw -Encoding UTF8).TrimEnd())
$writer.WriteLine("<style>")
# escapa </style para nao encerrar o bloco <style> prematuramente
$css = (Get-Content "$SRC\style.css" -Raw -Encoding UTF8).TrimEnd() -replace '</([sS][tT][yY][lL][eE])', '<\/$1'
$writer.WriteLine($css)
$writer.WriteLine("</style>")
$writer.WriteLine("</head>")

# 2. <body>
$writer.WriteLine((Get-Content "$SRC\body.html" -Raw -Encoding UTF8).TrimEnd())

# 3. JS unificado em uma única tag <script>
$writer.WriteLine("<script>")
foreach ($f in $JS_FILES) {
  $name = Split-Path $f -Leaf
  $writer.WriteLine("/* === $name === */")
  # escapa </script para nao encerrar o bloco <script> prematuramente
  $js = (Get-Content $f -Raw -Encoding UTF8).TrimEnd() -replace '</([sS][cC][rR][iI][pP][tT])', '<\/$1'
  $writer.WriteLine($js)
  $writer.WriteLine("")
}
$writer.WriteLine("</script>")

# 4. Fechamento
$writer.WriteLine("</body>")
$writer.WriteLine("</html>")

$writer.Close()

$lines = (Get-Content $OUT).Count
Write-Host "Build OK -> $OUT ($lines linhas)"
