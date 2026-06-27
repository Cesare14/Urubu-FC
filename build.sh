#!/usr/bin/env bash
# build.sh — Urubu FC
# Gera dist/index.html a partir dos arquivos em src/
# Uso: bash build.sh  (rodar na pasta raiz do projeto, onde este arquivo está)

set -e

SRC="src"
OUT="dist/index.html"
mkdir -p dist

# Ordem de concatenação dos JS
JS_FILES=(
  "$SRC/js/config.js"
  "$SRC/js/state.js"
  "$SRC/js/ui.js"
  "$SRC/js/field.js"
  "$SRC/js/roster.js"
  "$SRC/js/market.js"
  "$SRC/js/analysis.js"
  "$SRC/js/share.js"
  "$SRC/js/app.js"
  "$SRC/js/legal.js"
)

{
  # 1. <head> + CSS inline
  cat "$SRC/head.html"
  echo "<style>"
  cat "$SRC/style.css"
  echo "</style>"
  echo "</head>"

  # 2. <body>
  cat "$SRC/body.html"

  # 3. Vendor: html2canvas inline (tag separada)
  echo "<script>"
  cat "$SRC/vendor/html2canvas.min.js"
  echo "</script>"

  # 4. JS unificado em uma única tag <script>
  echo "<script>"
  for f in "${JS_FILES[@]}"; do
    echo "/* === $(basename "$f") === */"
    cat "$f"
    echo ""
  done
  echo "</script>"

  # 5. Fechamento
  echo "</body>"
  echo "</html>"

} > "$OUT"

cp ads.txt dist/ads.txt

LINES=$(wc -l < "$OUT")
echo "Build OK → $OUT ($LINES linhas)"
