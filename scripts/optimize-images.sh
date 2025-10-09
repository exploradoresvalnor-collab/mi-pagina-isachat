#!/usr/bin/env bash
# Copia imágenes desde la raíz a assets/images y crea versiones webp optimizadas.
# No borra archivos originales.

set -euo pipefail
ROOT_DIR="$(dirname "$0")/.."
ASSETS_DIR="$ROOT_DIR/assets/images"
mkdir -p "$ASSETS_DIR"

# Extensiones que vamos a procesar
EXTS=("png" "jpg" "jpeg" "svg")

# Copiar y convertir
for ext in "${EXTS[@]}"; do
  shopt -s nullglob
  for f in "$ROOT_DIR"/*."$ext"; do
    base=$(basename "$f")
    # Normalize filename: replace spaces with dashes
    safe=$(echo "$base" | tr ' ' '-')
    cp -n "$f" "$ASSETS_DIR/$safe"
    # Crear webp para png/jpg/jpeg si cwebp está disponible
    if command -v cwebp >/dev/null 2>&1; then
      if [[ "$ext" != "svg" ]]; then
        cwebp -q 80 "$f" -o "$ASSETS_DIR/${safe%.*}.webp" >/dev/null 2>&1 || true
      fi
    fi
  done
  shopt -u nullglob
done

echo "Imágenes copiadas a $ASSETS_DIR (no se borraron originales)."
if command -v cwebp >/dev/null 2>&1; then
  echo "También se generaron .webp cuando fue posible."
else
  echo "Instala libwebp (cwebp) para generar webp automáticamente."
fi
