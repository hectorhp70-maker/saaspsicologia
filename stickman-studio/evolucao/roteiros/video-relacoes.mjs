// Renderiza um vídeo (WebM) do roteiro "Dinheiro, Relações e Psicologia"
// reutilizando as funções de desenho do próprio estúdio (evolucao/index.html).
// Uso:  node roteiros/video-relacoes.mjs   (precisa de playwright + chromium)
// Saída: roteiros/saida/30-video-relacoes.webm  +  stills por cena.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const __dir = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(__dir, '..', 'index.html')).href;
const out = join(__dir, 'saida');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 780 } });
const erros = [];
page.on('pageerror', e => erros.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

// Injeta roteiro + funções de desenho de cena no contexto da página.
await page.evaluate(() => {
  const base = clonar([...PRESETS_FABRICA].find(p => p.nome === 'Anderson'));

  // Pose a partir de alvos de mão (IK) + ângulos de perna. Retorna ângulos de osso.
  const poseDe = (braE, braD, pE, pD) => {
    const m = Object.assign({}, base, { anguloPernaE: pE, anguloPernaD: pD });
    const sk = construir(m).fk(300, 360);
    const o = sk.get('tronco');
    resolverIK(sk, 'maoE', o.ex - 46, o.ey + braE);
    resolverIK(sk, 'maoD', o.ex + 46, o.ey + braD);
    const p = {}; for (const b of sk.bones.values()) p[b.nome] = b.angle; return p;
  };

  // Cada cena: duração, expressão, cenário (claro), legenda, título e gesto.
  const cenas = [
    { dur: 3000, expr: 'neutro', cena: 'escritorio', titulo: 'Dinheiro & Relações', leg: 'A psicologia por trás do dinheiro no relacionamento', g: [60, 42, 6, -6] },
    { dur: 2600, expr: 'feliz', cena: 'escritorio', leg: 'Casais que CONVERSAM sobre dinheiro brigam menos.', g: [18, 52, 4, -4] },
    { dur: 2800, expr: 'preocupado', cena: 'banco', leg: 'Dinheiro não é planilha: é emoção, medo e história.', g: [48, -34, 8, -8] },
    { dur: 3000, expr: 'preocupado', cena: 'banco', leg: 'Emprestar para quem se ama mistura afeto e dívida.', g: [-40, 52, 10, -6] },
    { dur: 2800, expr: 'bravo', cena: 'rua', leg: "Dizer “não” com respeito protege a relação.", g: [-52, 28, -6, 6] },
    { dur: 2600, expr: 'feliz', cena: 'rua', leg: 'Metas em comum aproximam o casal.', g: [28, -50, 4, -4] },
    { dur: 2600, expr: 'neutro', cena: 'escritorio', leg: 'Transparência vale mais do que controle.', g: [46, 46, 6, -6] },
    { dur: 3400, expr: 'feliz', cena: 'escritorio', titulo: 'Surto Financeiro', leg: 'Fale de dinheiro. Sua relação agradece.', g: [-46, -46, -8, 8] },
  ];
  let acc = 0;
  cenas.forEach(c => { c.pose = poseDe(...c.g); c.t0 = acc; acc += c.dur; });
  window.ROTEIRO = cenas; window.TOTAL = acc; window.BASE = base;

  const wrap = (txt, max) => {
    const w = txt.split(/\s+/), out = []; let cur = '';
    for (const x of w) { if ((cur + ' ' + x).trim().length > max) { out.push(cur.trim()); cur = x; } else cur += ' ' + x; }
    if (cur.trim()) out.push(cur.trim()); return out;
  };
  const lerpPose = (a, b, f) => { const o = {}; for (const k in a) o[k] = a[k] + ((k in b ? b[k] : a[k]) - a[k]) * f; return o; };

  const legenda = (C, txt, titulo) => {
    C.save();
    C.fillStyle = 'rgba(20,24,33,0.82)';
    if (C.roundRect) { C.beginPath(); C.roundRect(24, 512, 552, 74, 12); C.fill(); } else C.fillRect(24, 512, 552, 74);
    C.fillStyle = '#fff'; C.textAlign = 'center'; C.textBaseline = 'middle'; C.font = '600 20px system-ui, sans-serif';
    const lines = wrap(txt, 38), lh = 26, y0 = 549 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, k) => C.fillText(ln, 300, y0 + k * lh));
    if (titulo) {
      C.font = '800 30px system-ui, sans-serif'; C.textAlign = 'center';
      C.lineWidth = 5; C.strokeStyle = '#fff'; C.strokeText(titulo, 300, 44);
      C.fillStyle = '#141821'; C.fillText(titulo, 300, 44);
    }
    C.restore();
  };

  // Desenha um quadro do roteiro no tempo t (ms) no contexto C (canvas 600x600).
  window.frame = (t, C) => {
    const R = window.ROTEIRO; let i = 0;
    while (i < R.length - 1 && t >= R[i + 1].t0) i++;
    const A = R[i], B = R[Math.min(i + 1, R.length - 1)];
    const f = Math.min(1, (t - A.t0) / A.dur);
    const fe = 0.5 - 0.5 * Math.cos(f * Math.PI);
    const pose = lerpPose(A.pose, B.pose, fe);
    const mr = Object.assign({}, window.BASE, { expressao: A.expr, cenario: A.cena });
    C.clearRect(0, 0, 600, 600);
    desenharCenario(C, A.cena, 600, 600);
    const bob = Math.sin(t / 360) * 3;
    const sk = construirPose(mr, pose).fk(300, 358 + bob);
    desenharStickman(C, sk, mr, mr.dna.tamanhoCabeca, false);
    legenda(C, A.leg, A.titulo);
  };
});

const total = await page.evaluate(() => window.TOTAL);
console.log('duração total:', (total / 1000).toFixed(1), 's');

// Grava o roteiro no canvas principal via MediaRecorder.
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
writeFileSync(out + '/30-video-relacoes.webm', Buffer.from(b64, 'base64'));
console.log('WebM:', Buffer.from(b64, 'base64').length, 'bytes');

// Stills determinísticos (meio de cada cena) para conferência.
const marcas = await page.evaluate(() => window.ROTEIRO.map(c => c.t0 + c.dur / 2));
for (let i = 0; i < marcas.length; i++) {
  const durl = await page.evaluate((t) => {
    const off = document.createElement('canvas'); off.width = 600; off.height = 600;
    window.frame(t, off.getContext('2d')); return off.toDataURL('image/png');
  }, marcas[i]);
  writeFileSync(`${out}/31-cena${i + 1}.png`, Buffer.from(durl.split(',')[1], 'base64'));
}
console.log('ERROS:', erros.length ? erros : 'nenhum');
await browser.close();
