#!/bin/bash
# build.sh — concatena todos os arquivos em dist/index.html
set -e
DIST="dist/index.html"
SRC="src"

mkdir -p dist

# HEAD
cat $SRC/head.html > $DIST
echo "<style>" >> $DIST
cat $SRC/style.css >> $DIST
echo "</style>" >> $DIST

# BODY HTML
cat $SRC/body.html >> $DIST

# SCRIPTS
echo "<script>" >> $DIST
cat $SRC/js/config.js \
    $SRC/js/state.js \
    $SRC/js/ui.js \
    $SRC/js/field.js \
    $SRC/js/roster.js \
    $SRC/js/market.js \
    $SRC/js/analysis.js \
    $SRC/js/share.js \
    $SRC/js/app.js >> $DIST
echo "</script>" >> $DIST

# LEGAL + COOKIE JS
echo "<script>" >> $DIST
cat $SRC/js/legal.js >> $DIST
echo "</script>" >> $DIST

echo "Build OK → $DIST ($(wc -l < $DIST) linhas)"
