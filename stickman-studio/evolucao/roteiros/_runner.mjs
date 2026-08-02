// Runner compartilhado dos roteiros: recebe uma lista de CENAS (dados) e grava
// um vídeo WebM reutilizando as funções do estúdio (evolucao/index.html).
// Cada tema (video-*.mjs) só precisa definir suas cenas e chamar gerar().
//
// Cena: { tipo:'fala'|'andar', dur, cena, expr, prop, g:[braE,braD,pE,pD], leg, titulo }
//   tipo 'fala'  → vista de frente, expressão + gesto (IK) + prop na mão + legenda
//   tipo 'andar' → perfil, atravessa o cenário
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'url';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Gestos padrão (alvo das mãos + ângulo das pernas).
export const G = {
  NEUTRO: [46, 44, 6, -6],     // braços relaxados ao lado
  REFLETE: [46, -30, 8, -8],   // mão direita ao queixo (pensar)
  MOSTRA: [40, -60, 6, -6],    // mão direita erguida (mostrar prop)
  APONTA: [44, -54, 6, -6],    // apontar/enfatizar
  ALTO: [-46, -46, -8, 8],     // braços para o alto
  ABRE: [-40, -40, 8, -8],     // braços abertos
};

export async function gerar({ nome, cenas, escala }) {
  // Fator para esticar/encolher a duração de todas as cenas (sincronizar narração).
  // Pode vir por argumento ou pela variável de ambiente ESCALA.
  const fator = escala || Number(process.env.ESCALA) || 1;
  const url = pathToFileURL(join(__dir, '..', 'index.html')).href;
  const out = join(__dir, 'saida'); mkdirSync(out, { recursive: true });
  const scratch = process.env.SCRATCH_OUT;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 820 } });
  const erros = [];
  page.on('pageerror', e => erros.push('PAGEERROR ' + e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  await page.evaluate(({ cenas, fator }) => {
    const base = clonar([...PRESETS_FABRICA].find(p => p.nome === 'Anderson'));
    base.cenario = 'nenhum';
    const gesto = (braE, braD, pE, pD) => {
      const m = Object.assign({}, base, { anguloPernaE: pE, anguloPernaD: pD });
      const sk = construir(m).fk(300, 360); const o = sk.get('tronco');
      resolverIK(sk, 'maoE', o.ex - 46, o.ey + braE); resolverIK(sk, 'maoD', o.ex + 46, o.ey + braD);
      const p = {}; for (const b of sk.bones.values()) p[b.nome] = b.angle; return p;
    };
    let acc = 0;
    cenas.forEach(s => { s.dur = Math.round(s.dur * fator); if (s.tipo === 'fala') s.pose = gesto(...(s.g || [46, 44, 6, -6])); s.t0 = acc; acc += s.dur; });
    window.S = cenas; window.TOTAL = acc; window.BASE = base;

    const wrap = (txt, max) => { const w = txt.split(/\s+/), o = []; let c = ''; for (const x of w) { if ((c + ' ' + x).trim().length > max) { o.push(c.trim()); c = x; } else c += ' ' + x; } if (c.trim()) o.push(c.trim()); return o; };
    const legenda = (C, txt, titulo, escuro) => {
      C.save();
      C.fillStyle = 'rgba(20,24,33,0.82)';
      if (C.roundRect) { C.beginPath(); C.roundRect(24, 512, 552, 74, 12); C.fill(); } else C.fillRect(24, 512, 552, 74);
      C.fillStyle = '#fff'; C.textAlign = 'center'; C.textBaseline = 'middle'; C.font = '600 20px system-ui, sans-serif';
      const lines = wrap(txt, 38), lh = 26, y0 = 549 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, k) => C.fillText(ln, 300, y0 + k * lh));
      if (titulo) { C.font = '800 30px system-ui, sans-serif'; C.lineWidth = 5; C.strokeStyle = escuro ? '#000' : '#fff'; C.strokeText(titulo, 300, 44); C.fillStyle = escuro ? '#fff' : '#141821'; C.fillText(titulo, 300, 44); }
      C.restore();
    };

    window.frame = (t, C) => {
      const S = window.S; let i = 0; while (i < S.length - 1 && t >= S[i + 1].t0) i++;
      const s = S[i], tt = t - s.t0, f = Math.min(1, tt / s.dur);
      C.clearRect(0, 0, 600, 600);
      desenharCenario(C, s.cena, 600, 600);
      const chao = 600 * 0.86, escuro = (s.cena === 'dramatico' || s.cena === 'noite');
      if (s.tipo === 'andar') {
        const m = Object.assign({}, window.BASE, { perfil: true, cenario: s.cena });
        const fase = (tt % 900) / 900;
        const sk = construirPose(m, poseCaminhada(fase)).fk(0, 0);
        const r = m.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
        const x = 110 + f * 380, bob = Math.abs(Math.sin(fase * Math.PI * 2)) * 4;
        C.save(); C.translate(x - (bb.minX + bb.largura / 2), chao - bb.maxY + bob); desenharStickman(C, sk, m, r, false); C.restore();
      } else {
        const anexos = Object.assign({}, window.BASE.anexos); if (s.prop) anexos[s.prop] = true;
        const m = Object.assign({}, window.BASE, { expressao: s.expr || 'neutro', cenario: s.cena, anexos });
        const pose = Object.assign({}, s.pose);
        const sway = Math.sin(tt / 520) * 2.5;
        pose.bracoSupE = (pose.bracoSupE || 0) + sway; pose.bracoSupD = (pose.bracoSupD || 0) - sway;
        const sk = construirPose(m, pose).fk(0, 0);
        const r = m.dna.tamanhoCabeca, bb = sk.getBoundingBox(r);
        const bob = Math.sin(tt / 700) * 2;
        C.save(); C.translate(300 - (bb.minX + bb.largura / 2), chao - bb.maxY + bob); desenharStickman(C, sk, m, r, false); C.restore();
      }
      legenda(C, s.leg, s.titulo, escuro);
    };
  }, { cenas, fator });

  const total = await page.evaluate(() => window.TOTAL);
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
  writeFileSync(join(out, nome + '.webm'), buf);
  if (scratch) writeFileSync(join(scratch, nome + '.webm'), buf);
  // still de conferência (~40% do vídeo)
  const durl = await page.evaluate((t) => { const o = document.createElement('canvas'); o.width = 600; o.height = 600; window.frame(t, o.getContext('2d')); return o.toDataURL('image/png'); }, total * 0.4);
  if (scratch) writeFileSync(join(scratch, nome + '-still.png'), Buffer.from(durl.split(',')[1], 'base64'));
  console.log(`[${nome}] ${(total / 1000).toFixed(1)}s | ${buf.length} bytes | ERROS: ${erros.length ? erros.join(' ; ') : 'nenhum'}`);
  await browser.close();
}
