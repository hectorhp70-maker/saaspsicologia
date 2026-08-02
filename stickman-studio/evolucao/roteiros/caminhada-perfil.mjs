// Grava um vídeo (WebM) do Anderson CAMINHANDO DE PERFIL, atravessando um
// cenário claro da esquerda para a direita, com ciclo de caminhada realista.
// Uso: node roteiros/caminhada-perfil.mjs   (playwright + chromium)
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
const __dir = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(__dir, '..', 'index.html')).href;
const out = join(__dir, 'saida'); mkdirSync(out, { recursive: true });

const scratch = process.env.SCRATCH_OUT; // opcional: 2ª cópia p/ inspeção
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });
const erros = [];
page.on('pageerror', e => erros.push('PAGEERROR ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);

await page.evaluate(() => {
  const base = clonar([...PRESETS_FABRICA].find(p => p.nome === 'Anderson'));
  base.perfil = true; base.expressao = 'neutro'; base.cenario = 'rua';
  window.BASE = base;
  const CIC = 900;         // ms por ciclo de passada
  const trav = 12000;      // ms para atravessar a tela
  window.TOTAL = trav;
  window.frame = (t, C) => {
    C.clearRect(0, 0, 600, 600);
    desenharCenario(C, base.cenario, 600, 600);
    const fase = (t % CIC) / CIC;
    const sk = construirPose(base, poseCaminhada(fase)).fk(0, 0);
    const r = base.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
    // caminha da esquerda p/ a direita; pés no "chão" (0.86*600)
    const x = 90 + (t / trav) * 430;
    const chao = 600 * 0.86;
    const bob = Math.abs(Math.sin((t % CIC) / CIC * Math.PI * 2)) * 4;
    C.save();
    C.translate(x - (bb.minX + bb.largura / 2), chao - bb.maxY + bob);
    desenharStickman(C, sk, base, r, false);
    C.restore();
  };
});

const b64 = await page.evaluate(async () => {
  const cv = document.getElementById('tela'), C = cv.getContext('2d');
  const rec = new MediaRecorder(cv.captureStream(30), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 5_000_000 });
  const chunks = []; rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  const done = new Promise(r => rec.onstop = r);
  const start = performance.now(); let parar = false;
  const driver = () => { const t = performance.now() - start; window.frame(t % window.TOTAL, C); if (t < window.TOTAL * 1.5 && !parar) requestAnimationFrame(driver); };
  rec.start(); requestAnimationFrame(driver);
  await new Promise(r => setTimeout(r, window.TOTAL * 1.5 + 200));
  parar = true; rec.stop(); await done;
  const buf = await new Blob(chunks).arrayBuffer(); const u = new Uint8Array(buf);
  let s = ''; for (let k = 0; k < u.length; k++) s += String.fromCharCode(u[k]); return btoa(s);
});
const buf = Buffer.from(b64, 'base64');
writeFileSync(join(out, 'caminhada-perfil.webm'), buf);
if (scratch) writeFileSync(join(scratch, '41-caminhada.webm'), buf);
console.log('WebM:', buf.length, 'bytes | ERROS:', erros.length ? erros : 'nenhum');
await browser.close();
