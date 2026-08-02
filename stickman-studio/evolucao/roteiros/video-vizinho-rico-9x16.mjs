// "A síndrome do vizinho rico" — versão 9:16 (Shorts/Reels), 1080x1920.
// Anderson PARADO gesticulando (vista de frente), cenário de subúrbio (casas/carros).
// Uso: node roteiros/video-vizinho-rico-9x16.mjs → roteiros/saida/vizinho-rico-9x16.webm
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
const __dir = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(__dir, '..', 'index.html')).href;
const out = join(__dir, 'saida'); mkdirSync(out, { recursive: true });
const scratch = process.env.SCRATCH_OUT;

const W = 1080, H = 1920;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 2100 } });
const erros = [];
page.on('pageerror', e => erros.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

const fator = Number(process.env.ESCALA) || 1;   // estica as cenas p/ casar narração
await page.evaluate(({ W, H, fator }) => {
  const base = clonar([...PRESETS_FABRICA].find(p => p.nome === 'Anderson'));
  const gesto = (braE, braD, pE, pD) => {
    const m = Object.assign({}, base, { anguloPernaE: pE, anguloPernaD: pD });
    const sk = construir(m).fk(300, 360); const o = sk.get('tronco');
    resolverIK(sk, 'maoE', o.ex - 46, o.ey + braE); resolverIK(sk, 'maoD', o.ex + 46, o.ey + braD);
    const p = {}; for (const b of sk.bones.values()) p[b.nome] = b.angle; return p;
  };
  const MOSTRA = [40, -60, 6, -6], APONTA = [44, -54, 6, -6], REFLETE = [46, -30, 8, -8], ABRE = [-40, -40, 8, -8], ALTO = [-46, -46, -8, 8], NEUTRO = [46, 44, 6, -6];

  const S = [
    { cena: 'suburbio', expr: 'neutro', g: NEUTRO, titulo: 'A síndrome do\nvizinho rico', leg: 'O carro novo do vizinho tirou o seu sono?', dur: 3400 },
    { cena: 'suburbio', expr: 'surpreso', prop: 'cartao', g: MOSTRA, leg: 'Comparação social: a gente gasta pra “empatar” com os outros.', dur: 3600 },
    { cena: 'suburbio', expr: 'preocupado', g: REFLETE, leg: 'A vitrine do vizinho esconde a fatura dele.', dur: 3200 },
    { cena: 'dramatico', expr: 'surto', g: ALTO, leg: 'Comprou o carro… e a inveja veio de brinde. SURTO!', dur: 3000 },
    { cena: 'suburbio', expr: 'neutro', g: APONTA, leg: 'Corra a SUA corrida — as outras não têm a sua meta.', dur: 3200 },
    { cena: 'suburbio', expr: 'feliz', g: ABRE, titulo: 'Surto Financeiro', leg: 'Rico é quem dorme tranquilo, não quem aparenta.', dur: 3600 },
  ];
  let acc = 0; S.forEach(s => { s.dur = Math.round(s.dur * fator); s.pose = gesto(...s.g); s.t0 = acc; acc += s.dur; });
  window.S = S; window.TOTAL = acc; window.BASE = base; window.WV = W; window.HV = H;

  const wrap = (txt, max) => { const o = []; txt.split('\n').forEach(par => { const w = par.split(/\s+/); let c = ''; for (const x of w) { if ((c + ' ' + x).trim().length > max) { o.push(c.trim()); c = x; } else c += ' ' + x; } if (c.trim()) o.push(c.trim()); }); return o; };
  const titulo = (C, txt, escuro) => {
    C.save(); C.textAlign = 'center'; C.textBaseline = 'middle'; C.font = '800 68px system-ui, sans-serif';
    const lines = txt.split('\n'), lh = 78, y0 = 150 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, k) => { C.lineWidth = 10; C.strokeStyle = escuro ? '#000' : '#fff'; C.strokeText(ln, W / 2, y0 + k * lh); C.fillStyle = escuro ? '#fff' : '#141821'; C.fillText(ln, W / 2, y0 + k * lh); });
    C.restore();
  };
  const legenda = (C, txt) => {
    C.save();
    const bx = 46, bw = W - 92, by = H * 0.775, bh = H * 0.155;
    C.fillStyle = 'rgba(20,24,33,0.86)';
    if (C.roundRect) { C.beginPath(); C.roundRect(bx, by, bw, bh, 28); C.fill(); } else C.fillRect(bx, by, bw, bh);
    C.fillStyle = '#fff'; C.textAlign = 'center'; C.textBaseline = 'middle'; C.font = '600 50px system-ui, sans-serif';
    const lines = wrap(txt, 24), lh = 62, y0 = by + bh / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, k) => C.fillText(ln, W / 2, y0 + k * lh));
    C.restore();
  };

  window.frame = (t, C) => {
    const S = window.S; let i = 0; while (i < S.length - 1 && t >= S[i + 1].t0) i++;
    const s = S[i], tt = t - s.t0, escuro = (s.cena === 'dramatico' || s.cena === 'noite');
    C.clearRect(0, 0, W, H);
    desenharCenario(C, s.cena, W, H);
    // Anderson parado, gesticulando (oscilação de braços + leve balanço)
    const m = Object.assign({}, window.BASE, { expressao: s.expr, cenario: s.cena, anexos: Object.assign({}, window.BASE.anexos, { nota: s.prop === 'nota', cartao: s.prop === 'cartao' }) });
    const pose = Object.assign({}, s.pose);
    const a = Math.sin(tt / 360), b = Math.sin(tt / 520 + 1);
    pose.bracoSupE = (pose.bracoSupE || 0) + a * 7; pose.bracoSupD = (pose.bracoSupD || 0) - a * 7;
    pose.bracoInfE = (pose.bracoInfE || 0) + b * 9; pose.bracoInfD = (pose.bracoInfD || 0) - b * 9;
    pose.tronco = (pose.tronco || 0) + Math.sin(tt / 900) * 1.4;
    const sk = construirPose(m, pose).fk(0, 0);
    const r = m.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
    const alvo = H * 0.44, esc = alvo / bb.altura, bob = Math.sin(tt / 620) * 5;
    C.save();
    C.translate(W / 2, H * 0.735 + bob); C.scale(esc, esc); C.translate(-(bb.minX + bb.largura / 2), -bb.maxY);
    desenharStickman(C, sk, m, r, false);
    C.restore();
    if (s.titulo) titulo(C, s.titulo, escuro);
    legenda(C, s.leg);
  };
}, { W, H, fator });

// Redimensiona o canvas principal para 9:16 e grava.
await page.evaluate(({ W, H }) => { const cv = document.getElementById('tela'); cv.width = W; cv.height = H; }, { W, H });

const b64 = await page.evaluate(async () => {
  const cv = document.getElementById('tela'), C = cv.getContext('2d');
  const rec = new MediaRecorder(cv.captureStream(30), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8_000_000 });
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
writeFileSync(join(out, 'vizinho-rico-9x16.webm'), buf);
if (scratch) writeFileSync(join(scratch, 'vizinho-9x16.webm'), buf);
// still de conferência
const durl = await page.evaluate(() => { const o = document.createElement('canvas'); o.width = window.WV; o.height = window.HV; window.frame(window.S[1].t0 + 800, o.getContext('2d')); return o.toDataURL('image/png'); });
if (scratch) writeFileSync(join(scratch, 'vizinho-9x16-still.png'), Buffer.from(durl.split(',')[1], 'base64'));
console.log(`9:16 ${(await page.evaluate(() => window.TOTAL)) / 1000}s | ${buf.length} bytes | ERROS: ${erros.length ? erros.join(' ; ') : 'nenhum'}`);
await browser.close();
