#!/usr/bin/env python3
"""
narrar.py — gera a locução (voz) das cenas do Stickman Studio com edge-tts.

Lê um projeto exportado pelo estúdio (JSON) ou um arquivo de legendas (.srt) e
sintetiza a fala de cada cena em pt-BR, gerando um MP3 por fala (e, opcional-
mente, uma faixa única concatenada, se o ffmpeg estiver disponível).

Requer: pip install edge-tts   (e, para --concat, o ffmpeg no PATH)

Exemplos:
  python narrar.py --project projeto-stickman.json --fps 24 --out narracao
  python narrar.py --srt legendas.srt --voz pt-BR-FranciscaNeural --out narracao
  python narrar.py --project projeto.json --dry-run
  python narrar.py --list-vozes
"""
import argparse
import asyncio
import json
import os
import re
import sys

VOZES_PTBR = [
    "pt-BR-AntonioNeural (masculino) — sugestão para o Anderson",
    "pt-BR-FranciscaNeural (feminino) — sugestão para a Ana",
    "pt-BR-ThalitaNeural (feminino)",
    "pt-BR-DonatoNeural (masculino)",
]


def cenas_do_projeto(path, fps):
    """Extrai (texto, duracao_seg) de cada cena com legenda de um projeto JSON."""
    with open(path, encoding="utf-8") as f:
        proj = json.load(f)
    timeline = proj.get("timeline", [])
    cenas = []
    for i, kf in enumerate(timeline):
        cap = (kf.get("caption") or "").strip()
        # duração = quadros até o próximo (a última cena não tem transição)
        frames = kf.get("frames", 12) if i < len(timeline) - 1 else kf.get("frames", 12)
        if cap:
            cenas.append({"texto": cap, "dur": frames / fps})
    return cenas


def _srt_ts(ts):
    h, m, rest = ts.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def cenas_do_srt(path):
    with open(path, encoding="utf-8") as f:
        blocos = re.split(r"\n\s*\n", f.read().strip())
    cenas = []
    for b in blocos:
        linhas = [x for x in b.splitlines() if x.strip()]
        if len(linhas) < 3:
            continue
        m = re.search(r"(\d\d:\d\d:\d\d,\d+)\s*-->\s*(\d\d:\d\d:\d\d,\d+)", linhas[1])
        if not m:
            continue
        dur = _srt_ts(m.group(2)) - _srt_ts(m.group(1))
        cenas.append({"texto": " ".join(linhas[2:]), "dur": dur})
    return cenas


async def sintetizar(texto, voz, rate, out):
    import edge_tts
    await edge_tts.Communicate(texto, voz, rate=rate).save(out)


def concatenar(arquivos, saida):
    """Junta os MP3s numa faixa só via ffmpeg (se disponível)."""
    import shutil
    import subprocess

    if not shutil.which("ffmpeg"):
        print("aviso: ffmpeg não encontrado — pulei o --concat.", file=sys.stderr)
        return False
    lista = saida + ".txt"
    with open(lista, "w") as f:
        for a in arquivos:
            f.write(f"file '{os.path.abspath(a)}'\n")
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", saida],
        check=True,
    )
    os.remove(lista)
    return True


def main():
    ap = argparse.ArgumentParser(description="Gera locução das cenas com edge-tts (pt-BR).")
    ap.add_argument("--project", help="projeto JSON exportado pelo estúdio")
    ap.add_argument("--srt", help="arquivo de legendas .srt")
    ap.add_argument("--fps", type=float, default=24, help="FPS (para calcular duração do projeto)")
    ap.add_argument("--voz", default="pt-BR-AntonioNeural", help="voz edge-tts (ex.: pt-BR-FranciscaNeural)")
    ap.add_argument("--rate", default="+0%", help="velocidade da fala, ex.: -10%% ou +15%%")
    ap.add_argument("--out", default="narracao", help="pasta de saída")
    ap.add_argument("--concat", metavar="ARQ.mp3", help="também gera uma faixa única (requer ffmpeg)")
    ap.add_argument("--dry-run", action="store_true", help="só mostra o que faria, sem sintetizar")
    ap.add_argument("--list-vozes", action="store_true", help="lista vozes pt-BR sugeridas e sai")
    args = ap.parse_args()

    if args.list_vozes:
        print("Vozes pt-BR sugeridas:")
        for v in VOZES_PTBR:
            print("  -", v)
        print('\nLista completa: edge-tts --list-voices | grep pt-BR')
        return

    if not args.project and not args.srt:
        ap.error("informe --project ou --srt")

    cenas = cenas_do_projeto(args.project, args.fps) if args.project else cenas_do_srt(args.srt)
    if not cenas:
        print("Nenhuma legenda/fala encontrada.", file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.out, exist_ok=True)
    pad = len(str(len(cenas)))
    arquivos = []
    print(f"{len(cenas)} falas · voz={args.voz} · rate={args.rate}")
    for i, c in enumerate(cenas, 1):
        nome = os.path.join(args.out, f"fala_{str(i).zfill(pad)}.mp3")
        arquivos.append(nome)
        print(f"  [{i}] ~{c['dur']:.1f}s  {nome}  «{c['texto']}»")
        if not args.dry_run:
            asyncio.run(sintetizar(c["texto"], args.voz, args.rate, nome))

    if args.dry_run:
        print("\n(dry-run: nada sintetizado)")
    elif args.concat:
        if concatenar(arquivos, args.concat):
            print(f"Faixa única: {args.concat}")


if __name__ == "__main__":
    main()
