#!/usr/bin/env node
/**
 * gerar-video.mjs — gera o vídeo do stickman 100% no terminal (sem navegador).
 *
 * Renderiza cada quadro em PNG com @resvg/resvg-js (browser-free) e monta o
 * vídeo com ffmpeg. Também gera as legendas .srt.
 *
 * Uso:
 *   node cli/gerar-video.mjs roteiro.json saida.mp4
 *   node cli/gerar-video.mjs roteiro.json saida.webm --webm
 *   node cli/gerar-video.mjs roteiro.json saida.mp4 --srt legendas.srt --keep
 *
 * Requer: npm install (traz @resvg/resvg-js) + ffmpeg no PATH.
 *
 * Formato do roteiro (JSON):
 * {
 *   "titulo": "CÉREBRO x DINHEIRO",
 *   "personagem": "anderson-canal",        // id de personagem OU objeto completo
 *   "fps": 24, "largura": 400, "altura": 500, "transicao": 10,
 *   "cenas": [
 *     { "pose": "present", "expressao": "neutro", "fundo": "creme",
 *       "objeto": "dinheiro", "surto": 0, "quadros": 40, "fala": "..." }
 *   ]
 * }
 * `pose` = id (idle, point, present, sad, shrug, think, melt, wave, run, jump)
 * ou use "angulos": { ... } para ângulos explícitos.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { poseToSVG, normalizePose } from '../src/skeleton.js';
import { defaultCharacters, normalizeCharacter } from '../src/characters.js';
import { defaultPoses } from '../src/poses.js';
import { interpolatePoses } from '../src/interpolate.js';

const POSES = Object.fromEntries(defaultPoses.map((p) => [p.id, p.angles]));
Object.assign(POSES, {
  present: { spineLean: -3, shoulderL: -40, elbowL: -55, shoulderR: 40, elbowR: -55, hipL: -8, kneeL: 5, hipR: 8, kneeR: 5 },
  sad: { spineLean: 8, shoulderL: 20, elbowL: 35, shoulderR: -20, elbowR: 35, hipL: -8, kneeL: 5, hipR: 8, kneeR: 5 },
  melt: { spineLean: 0, shoulderL: -150, elbowL: -25, shoulderR: 150, elbowR: 25, hipL: -14, kneeL: 14, hipR: 14, kneeR: 14 },
  alert: { spineLean: -6, shoulderL: -45, elbowL: -25, shoulderR: 45, elbowR: 25, hipL: -10, kneeL: 6, hipR: 10, kneeR: 6 },
});

const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function srtTime(sec) {
  const ms = Math.round(sec * 1000);
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
}

function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('error', rej);
    p.on('close', (code) => (code === 0 ? res() : rej(new Error(`${cmd} saiu com código ${code}`))));
  });
}

async function main() {
  const [, , roteiroPath, saida, ...rest] = process.argv;
  if (!roteiroPath || !saida) {
    console.error('uso: node cli/gerar-video.mjs roteiro.json saida.mp4 [--webm] [--srt arq.srt] [--keep]');
    process.exit(1);
  }
  const webm = rest.includes('--webm');
  const keep = rest.includes('--keep');
  const srtOut = rest.includes('--srt') ? rest[rest.indexOf('--srt') + 1] : null;

  const roteiro = JSON.parse(readFileSync(roteiroPath, 'utf8'));
  const fps = roteiro.fps || 24;
  const W = roteiro.largura || 400;
  const H = roteiro.altura || 500;
  const TR = roteiro.transicao ?? 10;
  const titulo = roteiro.titulo || '';
  const base = typeof roteiro.personagem === 'string'
    ? normalizeCharacter(defaultCharacters.find((c) => c.id === roteiro.personagem) || {})
    : normalizeCharacter(roteiro.personagem || {});

  // monta os quadros (interpolação + hold por cena)
  const frames = [];
  const legendas = [];
  let prev = POSES.idle;
  for (const cena of roteiro.cenas) {
    const alvo = cena.angulos || POSES[cena.pose] || POSES.idle;
    const hold = cena.quadros || 36;
    const seg = interpolatePoses(normalizePose(prev), normalizePose(alvo), TR);
    seg.forEach((a, k) => { if (k === 0 && frames.length) return; frames.push({ a, cena }); });
    for (let h = 0; h < hold; h++) {
      const a = { ...alvo };
      if ((cena.surto || 0) >= 7) { const g = frames.length; a.spineLean += (rnd(g) - 0.5) * 6; a.shoulderL += (rnd(g + 1) - 0.5) * 10; a.shoulderR += (rnd(g + 2) - 0.5) * 10; }
      else a.spineLean += Math.sin(h / 6) * 1.3;
      frames.push({ a, cena });
    }
    if (cena.fala) legendas.push({ cap: cena.fala, dur: (TR + hold) / fps });
    prev = alvo;
  }

  console.log(`${roteiro.cenas.length} cenas · ${frames.length} quadros · ${(frames.length / fps).toFixed(1)}s @ ${fps}fps`);

  const dir = mkdtempSync(join(tmpdir(), 'stickman-'));
  try {
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const svg = poseToSVG(f.a, { ...base, prop: f.cena.objeto || base.prop || 'none' }, {
        background: f.cena.fundo || 'white', expression: f.cena.expressao || 'neutro',
        surto: f.cena.surto || 0, caption: f.cena.fala || null, title: titulo,
        phase: (i / frames.length) % 1, width: W, height: H,
      });
      const png = new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng();
      writeFileSync(join(dir, `frame_${String(i + 1).padStart(6, '0')}.png`), png);
      if (i % 40 === 0) process.stdout.write(`\r  render ${i + 1}/${frames.length}`);
    }
    process.stdout.write(`\r  render ${frames.length}/${frames.length}\n`);

    // legendas .srt
    if (srtOut) {
      let t = 0, idx = 1;
      const parts = [];
      for (const l of legendas) { parts.push(`${idx++}\n${srtTime(t)} --> ${srtTime(t + l.dur)}\n${l.cap}\n`); t += l.dur; }
      writeFileSync(srtOut, parts.join('\n'));
      console.log('legendas:', srtOut);
    }

    // monta o vídeo com ffmpeg
    const vargs = webm
      ? ['-c:v', 'libvpx-vp9', '-b:v', '2M', '-pix_fmt', 'yuva420p']
      : ['-c:v', 'libx264', '-pix_fmt', 'yuv420p'];
    const ffargs = ['-y', '-framerate', String(fps), '-i', join(dir, 'frame_%06d.png'), ...vargs, saida];
    console.log('ffmpeg', ffargs.join(' '));
    try {
      await run('ffmpeg', ffargs);
      console.log('vídeo:', saida);
    } catch (e) {
      console.error('\n[ffmpeg] falhou (instale com: apt install ffmpeg). Os PNGs ficaram em:', dir);
      console.error('Rode manualmente:\n  ffmpeg ' + ffargs.join(' '));
      return;
    }
  } finally {
    if (!keep) rmSync(dir, { recursive: true, force: true });
    else console.log('PNGs mantidos em:', dir);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
