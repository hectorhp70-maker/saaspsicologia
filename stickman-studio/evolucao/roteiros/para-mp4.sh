#!/usr/bin/env bash
# Converte todos os .webm de saida/ para .mp4 (H.264) prontos para o YouTube.
# Requer ffmpeg instalado. Uso: bash roteiros/para-mp4.sh
set -e
dir="$(cd "$(dirname "$0")/saida" && pwd)"
for f in "$dir"/*.webm; do
  [ -e "$f" ] || continue
  out="${f%.webm}.mp4"
  ffmpeg -y -i "$f" -c:v libx264 -pix_fmt yuv420p -movflags +faststart \
    -vf "pad=ceil(iw/2)*2:ceil(ih/2)*2" "$out"
  echo "OK: $out"
done
