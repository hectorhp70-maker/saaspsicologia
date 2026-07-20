#!/usr/bin/env python3
"""
narrar.py — gera a locução (voz) das cenas do Stickman Studio com edge-tts,
com vozes por personagem, e (opcional) junta narração + vídeo num .mp4 final.

Lê um projeto exportado pelo estúdio (JSON) ou um arquivo de legendas (.srt).
Se a fala vier no formato "Nome: texto", usa a voz do personagem (mapa
configurável); senão usa a voz padrão.

Requer: pip install edge-tts       (para --video/--mux/--concat: ffmpeg no PATH)

Exemplos:
  python narrar.py --project projeto.json --fps 24 --out narracao
  python narrar.py --srt legendas.srt --voz pt-BR-FranciscaNeural
  # diálogo com vozes por personagem + juntar com o vídeo:
  python narrar.py --srt dialogo.srt --video dialogo.webm --mux final.mp4
  python narrar.py --srt dialogo.srt --video v.webm --mux final.mp4 --dry-run
  python narrar.py --list-vozes
"""
import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys

VOZES_PTBR = [
    "pt-BR-AntonioNeural (masculino)",
    "pt-BR-FranciscaNeural (feminino)",
    "pt-BR-ThalitaNeural (feminino)",
    "pt-BR-DonatoNeural (masculino)",
]

# Mapa padrão nome -> voz (nomes normalizados em minúsculas).
VOZES_PADRAO = {
    "anderson": "pt-BR-AntonioNeural",
    "ana": "pt-BR-FranciscaNeural",
}

PREFIXO = re.compile(r"^\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .]{1,20}?):\s*(.+)$", re.S)


def separar_falante(texto):
    """'Ana: bla' -> ('ana', 'bla'). Sem prefixo -> (None, texto)."""
    m = PREFIXO.match(texto.strip())
    if m:
        return m.group(1).strip().lower(), m.group(2).strip()
    return None, texto.strip()


def cenas_do_projeto(path, fps):
    with open(path, encoding="utf-8") as f:
        proj = json.load(f)
    timeline = proj.get("timeline", [])
    cenas, t = [], 0.0
    for kf in timeline:
        cap = (kf.get("caption") or "").strip()
        dur = (kf.get("frames", 12)) / fps
        if cap:
            cenas.append({"texto": cap, "start": t, "dur": dur})
        t += dur
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
        start = _srt_ts(m.group(1))
        cenas.append({"texto": " ".join(linhas[2:]), "start": start, "dur": _srt_ts(m.group(2)) - start})
    return cenas


def resolver_voz(texto, voz_padrao, mapa):
    nome, fala = separar_falante(texto)
    voz = mapa.get(nome, voz_padrao) if nome else voz_padrao
    return nome, fala, voz


async def sintetizar(texto, voz, rate, out):
    import edge_tts
    await edge_tts.Communicate(texto, voz, rate=rate).save(out)


def cmd_mux(video, falas, saida):
    """Monta o comando ffmpeg: cada fala entra atrasada até seu 'start' e é
    mixada numa faixa; o vídeo é recodificado para H.264/AAC em .mp4."""
    inputs = ["-i", video]
    for f in falas:
        inputs += ["-i", f["arquivo"]]
    filtros, rotulos = [], []
    for j, f in enumerate(falas):
        ms = int(f["start"] * 1000)
        filtros.append(f"[{j + 1}]adelay={ms}|{ms}[a{j}]")
        rotulos.append(f"[a{j}]")
    filtros.append("".join(rotulos) + f"amix=inputs={len(falas)}:normalize=0[a]")
    return [
        "ffmpeg", "-y", *inputs,
        "-filter_complex", ";".join(filtros),
        "-map", "0:v", "-map", "[a]",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
        saida,
    ]


def main():
    ap = argparse.ArgumentParser(description="Locução (edge-tts, pt-BR) + mux de vídeo.")
    ap.add_argument("--project", help="projeto JSON exportado pelo estúdio")
    ap.add_argument("--srt", help="arquivo de legendas .srt")
    ap.add_argument("--fps", type=float, default=24, help="FPS (para calcular tempo do projeto)")
    ap.add_argument("--voz", default="pt-BR-AntonioNeural", help="voz padrão")
    ap.add_argument("--vozes", default="", help="mapa nome=voz separado por vírgula, ex.: 'anderson=pt-BR-AntonioNeural,ana=pt-BR-FranciscaNeural'")
    ap.add_argument("--rate", default="+0%", help="velocidade da fala, ex.: -10%% ou +12%%")
    ap.add_argument("--out", default="narracao", help="pasta de saída dos MP3")
    ap.add_argument("--video", help="vídeo (.webm) para juntar com a narração")
    ap.add_argument("--mux", metavar="FINAL.mp4", help="arquivo .mp4 final (requer --video e ffmpeg)")
    ap.add_argument("--concat", metavar="ARQ.mp3", help="também gera uma faixa única concatenada (requer ffmpeg)")
    ap.add_argument("--dry-run", action="store_true", help="só mostra o plano/comando, sem sintetizar nem rodar ffmpeg")
    ap.add_argument("--list-vozes", action="store_true", help="lista vozes pt-BR sugeridas e sai")
    args = ap.parse_args()

    if args.list_vozes:
        print("Vozes pt-BR sugeridas:")
        for v in VOZES_PTBR:
            print("  -", v)
        print("\nMapa padrão por personagem:", VOZES_PADRAO)
        print("Lista completa: edge-tts --list-voices | grep pt-BR")
        return

    if not args.project and not args.srt:
        ap.error("informe --project ou --srt")
    if args.mux and not args.video:
        ap.error("--mux requer --video")

    mapa = dict(VOZES_PADRAO)
    for par in filter(None, args.vozes.split(",")):
        if "=" in par:
            k, v = par.split("=", 1)
            mapa[k.strip().lower()] = v.strip()

    cenas = cenas_do_projeto(args.project, args.fps) if args.project else cenas_do_srt(args.srt)
    if not cenas:
        print("Nenhuma legenda/fala encontrada.", file=sys.stderr)
        sys.exit(1)

    os.makedirs(args.out, exist_ok=True)
    pad = len(str(len(cenas)))
    falas = []
    print(f"{len(cenas)} falas · voz padrão={args.voz} · rate={args.rate}")
    for i, c in enumerate(cenas, 1):
        nome, fala, voz = resolver_voz(c["texto"], args.voz, mapa)
        arq = os.path.join(args.out, f"fala_{str(i).zfill(pad)}.mp3")
        falas.append({"arquivo": arq, "start": c["start"], "voz": voz, "texto": fala})
        quem = f"[{nome}] " if nome else ""
        print(f"  [{i}] t={c['start']:.1f}s voz={voz}  {arq}  {quem}«{fala}»")
        if not args.dry_run:
            asyncio.run(sintetizar(fala, voz, args.rate, arq))

    if args.dry_run:
        print("\n(dry-run: nada sintetizado)")
        if args.mux:
            print("Comando ffmpeg do mux:\n ", " ".join(cmd_mux(args.video, falas, args.mux)))
        return

    if args.concat:
        if shutil.which("ffmpeg"):
            lista = args.concat + ".txt"
            with open(lista, "w") as f:
                for x in falas:
                    f.write(f"file '{os.path.abspath(x['arquivo'])}'\n")
            subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", args.concat], check=True)
            os.remove(lista)
            print("Faixa única:", args.concat)
        else:
            print("aviso: ffmpeg ausente — pulei --concat.", file=sys.stderr)

    if args.mux:
        if not shutil.which("ffmpeg"):
            print("erro: ffmpeg é necessário para --mux (apt install ffmpeg).", file=sys.stderr)
            sys.exit(2)
        subprocess.run(cmd_mux(args.video, falas, args.mux), check=True)
        print("Vídeo final:", args.mux)


if __name__ == "__main__":
    main()
