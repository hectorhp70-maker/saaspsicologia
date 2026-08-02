// Vídeo "Dinheiro, Relações e Psicologia" (v2) — combina cenas de FALA
// (vista de frente, expressão + gesto + legenda) com cenas ANDANDO (perfil,
// atravessando o cenário). Reutiliza as funções do estúdio (evolucao/index.html).
// Uso: node roteiros/video-relacoes-2.mjs   → roteiros/saida/video-relacoes-2.webm
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
const __dir = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(__dir, '..', 'index.html')).href;
const out = join(__dir, 'saida'); mkdirSync(out, { recursive: true });
const scratch = process.env.SCRATCH_OUT;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });
const erros = [];
page.on('pageerror', e => erros.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

await page.evaluate(() => {
  const base = clonar([...PRESETS_FABRICA].find(p => p.nome === 'Anderson'));
  base.cenario = 'nenhum';

  const gesto = (braE, braD, pE, pD) => {
    const m = Object.assign({}, base, { anguloPernaE: pE, anguloPernaD: pD });
    const sk = construir(m).fk(300, 360);
    const o = sk.get('tronco');
    resolverIK(sk, 'maoE', o.ex - 46, o.ey + braE);
    resolverIK(sk, 'maoD', o.ex + 46, o.ey + braD);
    const p = {}; for (const b of sk.bones.values()) p[b.nome] = b.angle; return p;
  };

  // tipo 'fala' (frente) ou 'andar' (perfil, atravessa)
  const S = [
    { tipo: 'andar', dur: 3200, cena: 'parque', titulo: 'Dinheiro, Relações & Psicologia', leg: 'A mente por trás do dinheiro a dois' },
    { tipo: 'fala', dur: 2600, cena: 'casa', expr: 'feliz', leg: 'Casais que CONVERSAM sobre dinheiro brigam menos.', g: [18, 52, 4, -4] },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'preocupado', leg: 'Dinheiro não é planilha: é emoção, medo e história.', g: [48, -34, 8, -8] },
    { tipo: 'fala', dur: 3000, cena: 'cafe', expr: 'preocupado', leg: 'Emprestar para quem se ama mistura afeto e dívida.', g: [-40, 52, 10, -6] },
    { tipo: 'andar', dur: 2800, cena: 'rua', leg: 'Combine as regras ANTES do conflito, não durante.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'bravo', leg: "Dizer “não” com respeito protege a relação.", g: [-52, 28, -6, 6] },
    { tipo: 'fala', dur: 2600, cena: 'parque', expr: 'feliz', leg: 'Metas em comum aproximam o casal.', g: [28, -50, 4, -4] },
    { tipo: 'fala', dur: 2600, cena: 'cafe', expr: 'neutro', leg: 'Transparência vale mais do que controle.', g: [46, 46, 6, -6] },
    { tipo: 'fala', dur: 3400, cena: 'parque', expr: 'feliz', titulo: 'Surto Financeiro', leg: 'Fale de dinheiro. Sua relação agradece.', g: [-46, -46, -8, 8] },
  ];
  let acc = 0;
  S.forEach(s => { if (s.tipo === 'fala') s.pose = gesto(...s.g); s.t0 = acc; acc += s.dur; });
  window.S = S; window.TOTAL = acc; window.BASE = base;

  const wrap = (txt, max) => { const w = txt.split(/\s+/), o = []; let c = ''; for (const x of w) { if ((c + ' ' + x).trim().length > max) { o.push(c.trim()); c = x; } else c += ' ' + x; } if (c.trim()) o.push(c.trim()); return o; };
  const legenda = (C, txt, titulo) => {
    C.save();
    C.fillStyle = 'rgba(20,24,33,0.82)';
    if (C.roundRect) { C.beginPath(); C.roundRect(24, 512, 552, 74, 12); C.fill(); } else C.fillRect(24, 512, 552, 74);
    C.fillStyle = '#fff'; C.textAlign = 'center'; C.textBaseline = 'middle'; C.font = '600 20px system-ui, sans-serif';
    const lines = wrap(txt, 38), lh = 26, y0 = 549 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, k) => C.fillText(ln, 300, y0 + k * lh));
    if (titulo) { C.font = '800 30px system-ui, sans-serif'; C.lineWidth = 5; C.strokeStyle = '#fff'; C.strokeText(titulo, 300, 44); C.fillStyle = '#141821'; C.fillText(titulo, 300, 44); }
    C.restore();
  };

  window.frame = (t, C) => {
    const S = window.S; let i = 0; while (i < S.length - 1 && t >= S[i + 1].t0) i++;
    const s = S[i], tt = t - s.t0, f = Math.min(1, tt / s.dur);
    C.clearRect(0, 0, 600, 600);
    desenharCenario(C, s.cena, 600, 600);
    const chao = 600 * 0.86;
    if (s.tipo === 'andar') {
      const m = Object.assign({}, window.BASE, { perfil: true, cenario: s.cena });
      const fase = (tt % 900) / 900;
      const sk = construirPose(m, poseCaminhada(fase)).fk(0, 0);
      const r = m.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
      const x = 110 + f * 380, bob = Math.abs(Math.sin(fase * Math.PI * 2)) * 4;
      C.save(); C.translate(x - (bb.minX + bb.largura / 2), chao - bb.maxY + bob); desenharStickman(C, sk, m, r, false); C.restore();
    } else {
      const m = Object.assign({}, window.BASE, { expressao: s.expr, cenario: s.cena });
      const pose = Object.assign({}, s.pose);
      const sway = Math.sin(tt / 520) * 2.5;      // respiração/balanço leve
      pose.bracoSupE = (pose.bracoSupE || 0) + sway; pose.bracoSupD = (pose.bracoSupD || 0) - sway;
      const sk = construirPose(m, pose).fk(0, 0);
      const r = m.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
      const bob = Math.sin(tt / 700) * 2;
      C.save(); C.translate(300 - (bb.minX + bb.largura / 2), chao - bb.maxY + bob); desenharStickman(C, sk, m, r, false); C.restore();
    }
    legenda(C, s.leg, s.titulo);
  };
});

const total = await page.evaluate(() => window.TOTAL);
console.log('duração:', (total / 1000).toFixed(1), 's');
const b64 = await page.evaluate(async () => {
  const cv = document.getElementById('tela'), C = cv.getContext('2d');
  const rec = new MediaRecorder(cv.captureStream(30), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 5_000_000 });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const done = new Promise(r => rec.onstop = r);
  const start = performance.now(); let parar = false;
  const driver = () => { const t = performance.now() - start; window.frame(Math.min(t, window.TOTAL - 1), C); if (t < window.TOTAL && !parar) requestAnimationFrame(driver); };
  rec.start(); requestAnimationFrame(driver);
  await new Promise(r => setTimeout(r, window.TOTAL + 250));
  parar = true; rec.stop(); await done;
  const buf = await new Blob(chunks).arrayBuffer(); const u = new Uint8Array(buf);
  let s = ''; for (let k = 0; k < u.length; k++) s += String.fromCharCode(u[k]); return btoa(s);
});
const buf = Buffer.from(b64, 'base64');
writeFileSync(join(out, 'video-relacoes-2.webm'), buf);
if (scratch) writeFileSync(join(scratch, '50-relacoes2.webm'), buf);
// stills p/ conferência
const marcas = await page.evaluate(() => window.S.map(s => s.t0 + s.dur / 2));
for (let i = 0; i < marcas.length; i++) {
  const d = await page.evaluate((t) => { const o = document.createElement('canvas'); o.width = 600; o.height = 600; window.frame(t, o.getContext('2d')); return o.toDataURL('image/png'); }, marcas[i]);
  if (scratch) writeFileSync(join(scratch, `51-cena${i + 1}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
console.log('WebM:', buf.length, 'bytes | ERROS:', erros.length ? erros : 'nenhum');
await browser.close();
