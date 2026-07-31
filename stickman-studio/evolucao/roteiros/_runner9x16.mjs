// Runner VERTICAL 9:16 (1080x1920) para Shorts/Reels. Igual ao _runner.mjs,
// mas em pé de retrato: título grande no topo, personagem grande no centro,
// legenda grande embaixo. Suporta cenas 'fala' (parado gesticulando) e 'andar'
// (perfil atravessando). Estica o tempo com { escala } ou a variável ESCALA.
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
const __dir = dirname(fileURLToPath(import.meta.url));

export const G = {
  NEUTRO: [46, 44, 6, -6], REFLETE: [46, -30, 8, -8], MOSTRA: [40, -60, 6, -6],
  APONTA: [44, -54, 6, -6], ALTO: [-46, -46, -8, 8], ABRE: [-40, -40, 8, -8],
};

export async function gerar9x16({ nome, cenas, escala }) {
  const W = 1080, H = 1920;
  const url = pathToFileURL(join(__dir, '..', 'index.html')).href;
  const out = join(__dir, 'saida'); mkdirSync(out, { recursive: true });
  const scratch = process.env.SCRATCH_OUT;
  const fator = escala || Number(process.env.ESCALA) || 1;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 2100 } });
  const erros = [];
  page.on('pageerror', e => erros.push('PAGEERROR ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.evaluate(({ W, H, cenas, fator }) => {
    const base = clonar([...PRESETS_FABRICA].find(p => p.nome === 'Anderson'));
    const gesto = (braE, braD, pE, pD) => {
      const m = Object.assign({}, base, { anguloPernaE: pE, anguloPernaD: pD });
      const sk = construir(m).fk(300, 360); const o = sk.get('tronco');
      resolverIK(sk, 'maoE', o.ex - 46, o.ey + braE); resolverIK(sk, 'maoD', o.ex + 46, o.ey + braD);
      const p = {}; for (const b of sk.bones.values()) p[b.nome] = b.angle; return p;
    };
    let acc = 0;
    cenas.forEach(s => { s.dur = Math.round(s.dur * fator); if (s.tipo !== 'andar') s.pose = gesto(...(s.g || [46, 44, 6, -6])); s.t0 = acc; acc += s.dur; });
    window.S = cenas; window.TOTAL = acc; window.BASE = base; window.WV = W; window.HV = H;

    const wrap = (txt, max) => { const o = []; String(txt).split('\n').forEach(par => { const w = par.split(/\s+/); let c = ''; for (const x of w) { if ((c + ' ' + x).trim().length > max) { o.push(c.trim()); c = x; } else c += ' ' + x; } if (c.trim()) o.push(c.trim()); }); return o; };
    const titulo = (C, txt, escuro) => {
      C.save(); C.textAlign = 'center'; C.textBaseline = 'middle'; C.font = '800 68px system-ui, sans-serif';
      const lines = String(txt).split('\n'), lh = 80, y0 = 150 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, k) => { C.lineWidth = 10; C.strokeStyle = escuro ? '#000' : '#fff'; C.strokeText(ln, W / 2, y0 + k * lh); C.fillStyle = escuro ? '#fff' : '#141821'; C.fillText(ln, W / 2, y0 + k * lh); });
      C.restore();
    };
    const legenda = (C, txt) => {
      C.save(); const bx = 46, bw = W - 92, by = H * 0.775, bh = H * 0.155;
      C.fillStyle = 'rgba(20,24,33,0.86)';
      if (C.roundRect) { C.beginPath(); C.roundRect(bx, by, bw, bh, 28); C.fill(); } else C.fillRect(bx, by, bw, bh);
      C.fillStyle = '#fff'; C.textAlign = 'center'; C.textBaseline = 'middle'; C.font = '600 50px system-ui, sans-serif';
      const lines = wrap(txt, 24), lh = 62, y0 = by + bh / 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, k) => C.fillText(ln, W / 2, y0 + k * lh));
      C.restore();
    };

    window.frame = (t, C) => {
      const S = window.S; let i = 0; while (i < S.length - 1 && t >= S[i + 1].t0) i++;
      const s = S[i], tt = t - s.t0, f = Math.min(1, tt / s.dur), escuro = (s.cena === 'dramatico' || s.cena === 'noite');
      C.clearRect(0, 0, W, H);
      desenharCenario(C, s.cena, W, H);
      if (s.tipo === 'andar') {
        const m = Object.assign({}, window.BASE, { perfil: true, cenario: s.cena });
        const fase = (tt % 900) / 900;
        const sk = construirPose(m, poseCaminhada(fase)).fk(0, 0);
        const r = m.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
        const alvo = H * 0.42, esc = alvo / bb.altura;
        const x = 160 + f * (W - 320), bob = Math.abs(Math.sin(fase * Math.PI * 2)) * 8;
        C.save(); C.translate(x, H * 0.735 + bob); C.scale(esc, esc); C.translate(-(bb.minX + bb.largura / 2), -bb.maxY); desenharStickman(C, sk, m, r, false); C.restore();
      } else {
        const m = Object.assign({}, window.BASE, { expressao: s.expr || 'neutro', cenario: s.cena, anexos: Object.assign({}, window.BASE.anexos, { nota: s.prop === 'nota', cartao: s.prop === 'cartao' }) });
        const pose = Object.assign({}, s.pose);
        const a = Math.sin(tt / 360), b = Math.sin(tt / 520 + 1);
        pose.bracoSupE = (pose.bracoSupE || 0) + a * 7; pose.bracoSupD = (pose.bracoSupD || 0) - a * 7;
        pose.bracoInfE = (pose.bracoInfE || 0) + b * 9; pose.bracoInfD = (pose.bracoInfD || 0) - b * 9;
        pose.tronco = (pose.tronco || 0) + Math.sin(tt / 900) * 1.4;
        const sk = construirPose(m, pose).fk(0, 0);
        const r = m.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
        const alvo = H * 0.44, esc = alvo / bb.altura, bob = Math.sin(tt / 620) * 5;
        C.save(); C.translate(W / 2, H * 0.735 + bob); C.scale(esc, esc); C.translate(-(bb.minX + bb.largura / 2), -bb.maxY); desenharStickman(C, sk, m, r, false); C.restore();
      }
      if (s.titulo) titulo(C, s.titulo, escuro);
      legenda(C, s.leg);
    };
  }, { W, H, cenas, fator });

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
  writeFileSync(join(out, nome + '.webm'), buf);
  if (scratch) writeFileSync(join(scratch, nome + '.webm'), buf);
  const durl = await page.evaluate(() => { const o = document.createElement('canvas'); o.width = window.WV; o.height = window.HV; window.frame(window.S[1] ? window.S[1].t0 + 700 : 700, o.getContext('2d')); return o.toDataURL('image/png'); });
  if (scratch) writeFileSync(join(scratch, nome + '-still.png'), Buffer.from(durl.split(',')[1], 'base64'));
  console.log(`[${nome}] 9:16 ${(await page.evaluate(() => window.TOTAL)) / 1000}s | ${buf.length} bytes | ERROS: ${erros.length ? erros.join(' ; ') : 'nenhum'}`);
  await browser.close();
}
