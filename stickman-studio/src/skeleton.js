// skeleton.js
// Esqueleto paramétrico do stickman.
//
// Convenção de ângulos (em graus):
//   - Um ângulo é medido a partir de um ponto de origem. 0 = apontando para BAIXO.
//     90 = para a direita, -90 = para a esquerda, 180 = para cima.
//   - Ombros e quadris usam ângulos ABSOLUTOS (relativos ao mundo).
//   - Cotovelos e joelhos usam ângulos RELATIVOS ao segmento anterior
//     (0 = continua reto; positivo/negativo dobra a articulação).
//   - spineLean inclina a coluna (0 = vertical).
//
// Todos os pontos são calculados por trigonometria a partir de origem + ângulo +
// comprimento. Não há coordenadas fixas de membros: trocar as proporções do
// personagem (character) reaproveita as mesmas poses.

import { backgroundSVG, surtoLayer, propSVG, DARK_BACKGROUNDS } from './effects.js';

const D2R = Math.PI / 180;

// Projeta um ponto a partir de `p`, num `angulo` (graus) e `comprimento`.
function project(p, angulo, comprimento) {
  const r = angulo * D2R;
  return {
    x: p.x + comprimento * Math.sin(r),
    y: p.y + comprimento * Math.cos(r),
  };
}

// Personagem padrão. Estrutura aberta para múltiplos personagens no futuro:
// basta clonar e mudar as proporções — as poses continuam válidas.
export const defaultCharacter = {
  id: 'anderson',
  nome: 'Anderson Patrimônio Armando Pecunia',
  headRadius: 34,
  spineLength: 92, // quadril -> pescoço
  upperArm: 46,
  foreArm: 46,
  thigh: 60,
  shin: 60,
  lineWidth: 8,
  jointRadius: 6, // "dot" nas mãos e pés
  color: '#111111',
  showFace: true,
  prop: 'none', // objeto na mão
  tie: false, // gravata
  tieColor: '#c0392b',
  hair: false, // cabelo
  hairColor: '#20140a',
  hairStyle: 'curto',
  jacket: false, // paletó (compat.; use `outfit`)
  jacketColor: '#2c3e50',
  outfit: 'nenhum',
  outfitColor: '#2c3e50',
  view: 'frente', // 'frente' | 'lado' (perfil)
  facing: 'dir', // 'dir' | 'esq' (direção que olha, no modo lado)
};

// Expressões faciais disponíveis (id + rótulo pt-BR).
export const EXPRESSIONS = [
  { id: 'neutro', label: 'Neutro' },
  { id: 'feliz', label: 'Feliz' },
  { id: 'triste', label: 'Triste' },
  { id: 'bravo', label: 'Bravo' },
  { id: 'surpreso', label: 'Surpreso' },
  { id: 'preocupado', label: 'Preocupado' },
  { id: 'furioso', label: 'Furioso (surto)' },
  { id: 'tonto', label: 'Tonto (X)' },
];

// Estilos de cabelo (inclui femininos e mais realistas).
export const HAIR_STYLES = [
  { id: 'curto', label: 'Curto (espetado)' },
  { id: 'ondulado', label: 'Ondulado' },
  { id: 'moicano', label: 'Moicano' },
  { id: 'longo', label: 'Longo (feminino)' },
  { id: 'chanel', label: 'Chanel/bob (feminino)' },
  { id: 'coque', label: 'Coque (feminino)' },
  { id: 'careca', label: 'Careca' },
];

// Roupas.
export const OUTFITS = [
  { id: 'nenhum', label: 'Nenhuma' },
  { id: 'paleto', label: 'Paletó' },
  { id: 'social', label: 'Camisa social' },
  { id: 'camiseta', label: 'Camiseta' },
  { id: 'vestido', label: 'Vestido' },
  { id: 'saia', label: 'Saia + top' },
];

// Lista de ângulos editáveis (usada pelos sliders e pela interpolação).
export const ANGLE_KEYS = [
  'spineLean',
  'shoulderL',
  'elbowL',
  'shoulderR',
  'elbowR',
  'hipL',
  'kneeL',
  'hipR',
  'kneeR',
];

// Metadados dos sliders (rótulo pt-BR e faixa).
export const ANGLE_META = {
  spineLean: { label: 'Inclinação da coluna', min: -45, max: 45 },
  shoulderL: { label: 'Ombro esquerdo', min: -180, max: 180 },
  elbowL: { label: 'Cotovelo esquerdo', min: -160, max: 160 },
  shoulderR: { label: 'Ombro direito', min: -180, max: 180 },
  elbowR: { label: 'Cotovelo direito', min: -160, max: 160 },
  hipL: { label: 'Quadril esquerdo', min: -120, max: 120 },
  kneeL: { label: 'Joelho esquerdo', min: -20, max: 160 },
  hipR: { label: 'Quadril direito', min: -120, max: 120 },
  kneeR: { label: 'Joelho direito', min: -20, max: 160 },
};

// Calcula todos os pontos do esqueleto para uma pose + personagem.
// origin = ponto do quadril (pelve). Se omitido, centraliza numa área width/height.
export function buildSkeleton(pose, character, width = 400, height = 500, originX = null) {
  const c = { ...defaultCharacter, ...character };
  const a = normalizePose(pose);

  const hip = { x: originX == null ? width / 2 : originX, y: height * 0.6 };

  const spineUp = 180 + a.spineLean; // coluna aponta para cima
  const neck = project(hip, spineUp, c.spineLength);
  const headCenter = project(neck, spineUp, c.headRadius);
  const shoulder = neck; // ombros no mesmo ponto do pescoço (stickman clássico)

  // Braços
  const elbowLpt = project(shoulder, a.shoulderL, c.upperArm);
  const handL = project(elbowLpt, a.shoulderL + a.elbowL, c.foreArm);
  const elbowRpt = project(shoulder, a.shoulderR, c.upperArm);
  const handR = project(elbowRpt, a.shoulderR + a.elbowR, c.foreArm);

  // Pernas
  const kneeLpt = project(hip, a.hipL, c.thigh);
  const footL = project(kneeLpt, a.hipL + a.kneeL, c.shin);
  const kneeRpt = project(hip, a.hipR, c.thigh);
  const footR = project(kneeRpt, a.hipR + a.kneeR, c.shin);

  return {
    character: c,
    points: { hip, neck, headCenter, shoulder, elbowLpt, handL, elbowRpt, handR, kneeLpt, footL, kneeRpt, footR },
    segments: [
      [hip, neck],
      [shoulder, elbowLpt],
      [elbowLpt, handL],
      [shoulder, elbowRpt],
      [elbowRpt, handR],
      [hip, kneeLpt],
      [kneeLpt, footL],
      [hip, kneeRpt],
      [kneeRpt, footR],
    ],
    dots: [handL, handR, footL, footR],
  };
}

// Garante que todos os ângulos existam (default 0).
export function normalizePose(pose) {
  const out = {};
  for (const k of ANGLE_KEYS) out[k] = Number(pose?.[k] ?? 0);
  return out;
}

const num = (n) => Number(n.toFixed(2));

function escapeXml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Título estilo canal (dourado com contorno escuro) no rodapé.
function titleSVG(text, w, h) {
  if (!text) return '';
  const len = Math.max(6, text.length);
  const fs = Math.max(15, Math.min(32, (w * 0.92) / len * 1.55));
  return `<text x="${num(w / 2)}" y="${num(h - 22)}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${num(fs)}" text-anchor="middle" fill="#f6c945" stroke="#1a1206" stroke-width="4.5" paint-order="stroke" letter-spacing="0.5">${escapeXml(text)}</text>`;
}

// Clareia/escurece uma cor hex (#rrggbb) por `amt` (-255..255).
function shade(hex, amt) {
  const n = String(hex).replace('#', '');
  const v = parseInt(n.length === 3 ? n.split('').map((c) => c + c).join('') : n, 16);
  const cl = (x) => Math.max(0, Math.min(255, x));
  const r = cl((v >> 16) + amt), g = cl(((v >> 8) & 0xff) + amt), b = cl((v & 0xff) + amt);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Paletó/blazer sobre o tronco (pescoço -> quadril), com decote em V, camisa,
// lapelas e linha de botões. Construído no eixo da coluna (acompanha a inclinação).
function jacketSVG(neck, hip, r, color) {
  const dx = hip.x - neck.x, dy = hip.y - neck.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, px = -uy, py = ux;
  const P = (d, w) => ({ x: neck.x + ux * d + px * w, y: neck.y + uy * d + py * w });
  const Wt = r * 1.05, Wh = r * 0.82;
  const pts = (arr) => arr.map((p) => num(p.x) + ',' + num(p.y)).join(' ');
  const darker = shade(color, -28);

  const A = P(0, Wt), B = P(0, -Wt), C = P(L * 0.98, -Wh), D = P(L * 0.98, Wh);
  const body = `<polygon points="${pts([A, B, C, D])}" fill="${color}" stroke="#00000055" stroke-width="1.5"/>`;

  const cL = P(L * 0.02, Wt * 0.5), cR = P(L * 0.02, -Wt * 0.5), vB = P(L * 0.5, 0);
  const shirt = `<polygon points="${pts([cL, cR, vB])}" fill="#f2ede2"/>`;
  const lapels = `<path d="M ${num(A.x)} ${num(A.y)} L ${num(vB.x)} ${num(vB.y)} L ${num(B.x)} ${num(B.y)}" fill="none" stroke="${darker}" stroke-width="${num(r * 0.12)}" stroke-linejoin="round"/>`;
  const bBot = P(L * 0.9, 0);
  const button = `<line x1="${num(vB.x)}" y1="${num(vB.y)}" x2="${num(bBot.x)}" y2="${num(bBot.y)}" stroke="${darker}" stroke-width="${num(r * 0.07)}"/>`;
  return body + shirt + lapels + button;
}

// Tronco (camiseta/top/vestido). `neckType`: 'crew' (redonda) ou 'v'.
function torsoSVG(neck, hip, r, color, { waist = 0.82, neckType = 'crew', collar = false } = {}) {
  const dx = hip.x - neck.x, dy = hip.y - neck.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L, px = -uy, py = ux;
  const P = (d, w) => ({ x: neck.x + ux * d + px * w, y: neck.y + uy * d + py * w });
  const pts = (arr) => arr.map((p) => num(p.x) + ',' + num(p.y)).join(' ');
  const Wt = r * 1.02, Wh = r * waist;
  const body = `<polygon points="${pts([P(0, Wt), P(0, -Wt), P(L * 0.98, -Wh), P(L * 0.98, Wh)])}" fill="${color}" stroke="#00000044" stroke-width="1.5"/>`;
  let extra = '';
  if (neckType === 'v') {
    const cL = P(0, Wt * 0.5), cR = P(0, -Wt * 0.5), vB = P(L * 0.42, 0);
    extra = `<polygon points="${pts([cL, cR, vB])}" fill="#f2ede2"/>`;
  } else {
    const nL = P(L * 0.02, Wt * 0.42), nR = P(L * 0.02, -Wt * 0.42), nB = P(L * 0.16, 0);
    extra = `<path d="M ${num(nL.x)} ${num(nL.y)} Q ${num(nB.x)} ${num(nB.y)} ${num(nR.x)} ${num(nR.y)}" fill="none" stroke="${shade(color, -30)}" stroke-width="${num(r * 0.08)}"/>`;
  }
  if (collar) {
    const dark = shade(color, -30);
    const A = P(0, Wt * 0.55), B = P(0, -Wt * 0.55), vB = P(L * 0.4, 0);
    extra += `<path d="M ${num(A.x)} ${num(A.y)} L ${num(vB.x)} ${num(vB.y)} L ${num(B.x)} ${num(B.y)}" fill="none" stroke="${dark}" stroke-width="${num(r * 0.1)}" stroke-linejoin="round"/>`;
    const bBot = P(L * 0.9, 0);
    extra += `<line x1="${num(vB.x)}" y1="${num(vB.y)}" x2="${num(bBot.x)}" y2="${num(bBot.y)}" stroke="${dark}" stroke-width="${num(r * 0.06)}"/>`;
  }
  return body + extra;
}

// Saia/vestido (parte de baixo), pendurando do quadril p/ baixo (gravidade).
function skirtSVG(hip, r, len, color) {
  const w = r * 1.55;
  const pts = (arr) => arr.map((p) => num(p.x) + ',' + num(p.y)).join(' ');
  const body = `<polygon points="${pts([
    { x: hip.x - r * 0.5, y: hip.y - r * 0.1 },
    { x: hip.x + r * 0.5, y: hip.y - r * 0.1 },
    { x: hip.x + w, y: hip.y + len },
    { x: hip.x - w, y: hip.y + len },
  ])}" fill="${color}" stroke="#00000044" stroke-width="1.5"/>`;
  const hem = `<line x1="${num(hip.x - w)}" y1="${num(hip.y + len)}" x2="${num(hip.x + w)}" y2="${num(hip.y + len)}" stroke="${shade(color, -25)}" stroke-width="${num(r * 0.08)}"/>`;
  return body + hem;
}

// Monta a roupa completa a partir do id.
function outfitSVG(outfit, neck, hip, r, thigh, color) {
  switch (outfit) {
    case 'paleto':
      return jacketSVG(neck, hip, r, color);
    case 'social':
      return torsoSVG(neck, hip, r, '#f2ede2', { neckType: 'crew', collar: true });
    case 'camiseta':
      return torsoSVG(neck, hip, r, color, { neckType: 'crew' });
    case 'vestido':
      return skirtSVG(hip, r, thigh * 1.15, color) + torsoSVG(neck, hip, r, color, { waist: 0.7, neckType: 'crew' });
    case 'saia':
      return skirtSVG(hip, r, thigh * 0.75, color) + torsoSVG(neck, hip, r, shade(color, 40), { waist: 0.72, neckType: 'crew' });
    default:
      return '';
  }
}

// Gravata pendurada do pescoço ao peito (ao longo da coluna).
function tieSVG(neck, hip, r, color) {
  const dx = hip.x - neck.x, dy = hip.y - neck.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L; // desce pela coluna
  const px = -uy, py = ux; // perpendicular
  const P = (d, w) => ({ x: neck.x + ux * d + px * w, y: neck.y + uy * d + py * w });
  const w0 = r * 0.14, w1 = r * 0.3;
  const poly = (pts) =>
    `<polygon points="${pts.map((p) => num(p.x) + ',' + num(p.y)).join(' ')}" fill="${color}" stroke="#00000055" stroke-width="1"/>`;
  const knot = poly([P(r * 0.12, w0 * 1.25), P(r * 0.12, -w0 * 1.25), P(r * 0.44, -w0), P(r * 0.44, w0)]);
  const body = poly([P(r * 0.44, w0), P(r * 0.44, -w0), P(r * 1.15, -w1), P(r * 1.48, 0), P(r * 1.15, w1)]);
  return knot + body;
}

// Cabelo por estilo. Coordenadas locais (centro da cabeça, y p/ baixo, raio r).
// Retorna { back, front }: `back` vai ATRÁS da cabeça (emoldura o rosto), `front`
// vai na frente (franja/tufos). Ambos acompanham a inclinação via `rot`.
function hairSVG(style, cx, cy, r, color, rot, lineWidth) {
  const wrap = (s) => (s ? `<g transform="translate(${num(cx)} ${num(cy)}) rotate(${num(rot)})">${s}</g>` : '');
  const lw = Math.max(2.5, lineWidth * 0.8);
  const arc = (deg) => ({ x: r * Math.cos((deg * Math.PI) / 180), y: r * Math.sin((deg * Math.PI) / 180) });
  const pth = (d, fill) => `<path d="${d}" fill="${fill}" stroke="${shade(color, -20)}" stroke-width="1"/>`;
  const dark = shade(color, -22);
  let back = '', front = '';

  const tufts = () => {
    return [-0.58, -0.29, 0, 0.29, 0.58]
      .map((fx) => {
        const x = fx * r;
        const by = -Math.sqrt(Math.max(0, r * r - x * x)) * 0.98;
        const dir = fx <= 0 ? -1 : 1;
        const len = r * (0.46 + 0.12 * Math.cos(fx * 3));
        return `<path d="M ${num(x)} ${num(by)} Q ${num(x + dir * r * 0.06)} ${num(by - len * 0.55)} ${num(x + dir * r * 0.2)} ${num(by - len)}" fill="none" stroke="${color}" stroke-width="${num(lw)}" stroke-linecap="round"/>`;
      })
      .join('');
  };

  // Cap com franja ondulada sobre o topo (usada em vários estilos).
  const wavyCap = () => {
    const A = arc(205), B = arc(-25);
    return pth(
      `M ${num(A.x)} ${num(A.y)} A ${num(r)} ${num(r)} 0 0 1 ${num(B.x)} ${num(B.y)} ` +
      `Q ${num(r * 0.5)} ${num(-r * 0.02)} ${num(r * 0.22)} ${num(-r * 0.18)} ` +
      `Q ${num(r * 0.02)} ${num(-r * 0.02)} ${num(-r * 0.18)} ${num(-r * 0.18)} ` +
      `Q ${num(-r * 0.42)} ${num(-r * 0.02)} ${num(A.x)} ${num(A.y)} Z`,
      color
    );
  };

  switch (style) {
    case 'careca':
      break;
    case 'moicano': {
      const y = -r * 0.9;
      front = pth(
        `M ${num(-0.22 * r)} ${num(y)} L ${num(-0.13 * r)} ${num(-1.55 * r)} L ${num(-0.04 * r)} ${num(-0.98 * r)} ` +
        `L ${num(0.05 * r)} ${num(-1.68 * r)} L ${num(0.14 * r)} ${num(-0.98 * r)} L ${num(0.22 * r)} ${num(-1.5 * r)} ` +
        `L ${num(0.24 * r)} ${num(y)} Z`,
        color
      );
      break;
    }
    case 'ondulado':
      front = wavyCap();
      break;
    case 'longo': {
      const fall = (s) => pth(
        `M ${num(s * 0.5 * r)} ${num(-0.55 * r)} ` +
        `C ${num(s * 1.2 * r)} ${num(-0.25 * r)} ${num(s * 1.25 * r)} ${num(0.9 * r)} ${num(s * 0.98 * r)} ${num(1.75 * r)} ` +
        `L ${num(s * 0.42 * r)} ${num(1.75 * r)} ` +
        `C ${num(s * 0.55 * r)} ${num(0.6 * r)} ${num(s * 0.5 * r)} ${num(-0.1 * r)} ${num(s * 0.25 * r)} ${num(-0.62 * r)} Z`,
        color
      );
      back = fall(-1) + fall(1);
      front = wavyCap();
      break;
    }
    case 'chanel': {
      back = pth(`M ${num(-1.12 * r)} ${num(0.78 * r)} A ${num(1.12 * r)} ${num(1.12 * r)} 0 1 1 ${num(1.12 * r)} ${num(0.78 * r)} Z`, color);
      // franja lateral
      front = `<path d="M ${num(-0.85 * r)} ${num(-0.55 * r)} Q ${num(0.2 * r)} ${num(-1.05 * r)} ${num(0.9 * r)} ${num(-0.35 * r)} Q ${num(0.2 * r)} ${num(-0.55 * r)} ${num(-0.85 * r)} ${num(-0.55 * r)} Z" fill="${color}" stroke="${dark}" stroke-width="1"/>`;
      break;
    }
    case 'coque': {
      back = `<circle cx="0" cy="${num(-1.2 * r)}" r="${num(0.38 * r)}" fill="${color}" stroke="${dark}" stroke-width="1"/>`;
      front = pth(
        `M ${num(arc(200).x)} ${num(arc(200).y)} A ${num(r)} ${num(r)} 0 0 1 ${num(arc(-20).x)} ${num(arc(-20).y)} ` +
        `Q 0 ${num(-r * 0.35)} ${num(arc(200).x)} ${num(arc(200).y)} Z`,
        color
      );
      break;
    }
    case 'curto':
    default:
      front = tufts();
  }

  return { back: wrap(back), front: wrap(front) };
}

// Legenda (fala) no topo, com quebra de linha automática. Fica legível em
// qualquer fundo (texto branco com contorno escuro).
function captionSVG(text, w) {
  if (!text) return '';
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  const max = 28;
  for (const wd of words) {
    if ((cur + ' ' + wd).trim().length > max) { lines.push(cur.trim()); cur = wd; }
    else cur += ' ' + wd;
  }
  if (cur.trim()) lines.push(cur.trim());
  const fs = 17, lh = fs * 1.3, y0 = 28;
  const tspans = lines
    .slice(0, 3)
    .map((ln, i) => `<tspan x="${num(w / 2)}" y="${num(y0 + i * lh)}">${escapeXml(ln)}</tspan>`)
    .join('');
  return `<text text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="${fs}" fill="#ffffff" stroke="#141414" stroke-width="3.5" paint-order="stroke">${tspans}</text>`;
}

// Desenha o rosto dentro da cabeça. Coordenadas locais (origem no centro da
// cabeça, y para baixo); o grupo é rotacionado por `rot` graus para acompanhar
// a inclinação da cabeça.
export function faceToSVG(cx, cy, r, expression, rot, color, lineWidth) {
  const eyeDX = 0.38 * r;
  const eyeY = -0.2 * r;
  const eyeR = Math.max(1.6, 0.08 * r);
  const browY = eyeY - 0.26 * r;
  const mouthY = 0.34 * r;
  const mw = 0.5 * r;
  const mh = 0.26 * r;
  const lw = Math.max(1.5, lineWidth * 0.55);

  const dot = (x, y, rr = eyeR) => `<circle cx="${num(x)}" cy="${num(y)}" r="${num(rr)}" fill="${color}"/>`;
  const stroke = `fill="none" stroke="${color}" stroke-width="${num(lw)}" stroke-linecap="round"`;
  const line = (x1, y1, x2, y2) => `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" ${stroke}/>`;
  const smile = () => `<path d="M ${num(-mw)} ${num(mouthY)} Q 0 ${num(mouthY + mh)} ${num(mw)} ${num(mouthY)}" ${stroke}/>`;
  const frown = (s = mh) => `<path d="M ${num(-mw)} ${num(mouthY)} Q 0 ${num(mouthY - s)} ${num(mw)} ${num(mouthY)}" ${stroke}/>`;
  const flat = () => line(-mw, mouthY, mw, mouthY);
  const circleMouth = () => `<circle cx="0" cy="${num(mouthY)}" r="${num(0.16 * r)}" ${stroke}/>`;
  const eyesDots = () => dot(-eyeDX, eyeY) + dot(eyeDX, eyeY);
  const eyesOpen = () =>
    `<circle cx="${num(-eyeDX)}" cy="${num(eyeY)}" r="${num(0.13 * r)}" ${stroke}/>` +
    `<circle cx="${num(eyeDX)}" cy="${num(eyeY)}" r="${num(0.13 * r)}" ${stroke}/>`;
  const eyesX = () => {
    const d = 0.11 * r;
    const one = (ex) =>
      line(ex - d, eyeY - d, ex + d, eyeY + d) + line(ex - d, eyeY + d, ex + d, eyeY - d);
    return one(-eyeDX) + one(eyeDX);
  };

  let inner = '';
  switch (expression) {
    case 'feliz':
      inner = eyesDots() + smile();
      break;
    case 'triste':
      inner = eyesDots() + frown() +
        line(-eyeDX - 0.16 * r, browY + 0.12 * r, -eyeDX + 0.1 * r, browY) +
        line(eyeDX + 0.16 * r, browY + 0.12 * r, eyeDX - 0.1 * r, browY);
      break;
    case 'bravo':
      inner = eyesDots() + frown(0.18 * r) +
        line(-eyeDX - 0.16 * r, browY, -eyeDX + 0.12 * r, browY + 0.16 * r) +
        line(eyeDX + 0.16 * r, browY, eyeDX - 0.12 * r, browY + 0.16 * r);
      break;
    case 'surpreso':
      inner = eyesOpen() + circleMouth();
      break;
    case 'preocupado':
      inner = eyesDots() + frown(0.12 * r) +
        line(-eyeDX - 0.14 * r, browY + 0.14 * r, -eyeDX + 0.12 * r, browY) +
        line(eyeDX + 0.14 * r, browY + 0.14 * r, eyeDX - 0.12 * r, browY);
      break;
    case 'furioso': {
      // sobrancelhas em V acentuadas + boca aberta (grito) com dentes
      const mouthOpen =
        `<path d="M ${num(-mw * 0.9)} ${num(mouthY - 0.02 * r)} Q 0 ${num(mouthY - 0.14 * r)} ${num(mw * 0.9)} ${num(mouthY - 0.02 * r)} Q ${num(mw * 0.7)} ${num(mouthY + 0.3 * r)} 0 ${num(mouthY + 0.34 * r)} Q ${num(-mw * 0.7)} ${num(mouthY + 0.3 * r)} ${num(-mw * 0.9)} ${num(mouthY - 0.02 * r)} Z" fill="${color}" stroke="${color}" stroke-width="${num(lw * 0.6)}" stroke-linejoin="round"/>` +
        `<line x1="${num(-mw * 0.7)}" y1="${num(mouthY + 0.02 * r)} " x2="${num(mw * 0.7)}" y2="${num(mouthY + 0.02 * r)}" fill="none" stroke="#ffffff" stroke-width="${num(lw * 0.5)}"/>`;
      inner =
        dot(-eyeDX, eyeY) + dot(eyeDX, eyeY) +
        line(-eyeDX - 0.22 * r, browY - 0.04 * r, -eyeDX + 0.14 * r, browY + 0.22 * r) +
        line(eyeDX + 0.22 * r, browY - 0.04 * r, eyeDX - 0.14 * r, browY + 0.22 * r) +
        mouthOpen;
      break;
    }
    case 'tonto':
      inner = eyesX() + circleMouth();
      break;
    case 'neutro':
    default:
      inner = eyesDots() + flat();
  }

  return `<g transform="translate(${num(cx)} ${num(cy)}) rotate(${num(rot)})">${inner}</g>`;
}

// Rosto de PERFIL (olhando para a direita). O flip de direção é feito fora.
export function profileFaceSVG(cx, cy, r, expression, rot, color, lineWidth) {
  const lw = Math.max(1.6, lineWidth * 0.55);
  const eyeX = r * 0.28, eyeY = -0.14 * r, eyeR = Math.max(1.8, 0.09 * r);
  const stroke = `fill="none" stroke="${color}" stroke-width="${num(lw)}" stroke-linecap="round"`;
  const mouthX = r * 0.42, mouthY = 0.36 * r, mw = 0.28 * r;
  const nose = `<path d="M ${num(r * 0.96)} ${num(-0.06 * r)} L ${num(r * 1.16)} ${num(0.06 * r)} L ${num(r * 0.92)} ${num(0.16 * r)}" ${stroke} stroke-linejoin="round"/>`;
  const eye = `<circle cx="${num(eyeX)}" cy="${num(eyeY)}" r="${num(eyeR)}" fill="${color}"/>`;
  const brow = (dy1, dy2) => `<line x1="${num(eyeX - 0.14 * r)}" y1="${num(eyeY - 0.24 * r + dy1)}" x2="${num(eyeX + 0.16 * r)}" y2="${num(eyeY - 0.24 * r + dy2)}" ${stroke}/>`;
  let mouth = `<line x1="${num(mouthX - mw)}" y1="${num(mouthY)}" x2="${num(mouthX + mw)}" y2="${num(mouthY)}" ${stroke}/>`;
  let extra = '';
  switch (expression) {
    case 'feliz':
      mouth = `<path d="M ${num(mouthX - mw)} ${num(mouthY)} Q ${num(mouthX)} ${num(mouthY + 0.22 * r)} ${num(mouthX + mw)} ${num(mouthY)}" ${stroke}/>`;
      break;
    case 'triste':
    case 'preocupado':
      mouth = `<path d="M ${num(mouthX - mw)} ${num(mouthY)} Q ${num(mouthX)} ${num(mouthY - 0.18 * r)} ${num(mouthX + mw)} ${num(mouthY)}" ${stroke}/>`;
      extra = brow(0.12 * r, 0);
      break;
    case 'bravo':
    case 'furioso':
      mouth = `<path d="M ${num(mouthX - mw)} ${num(mouthY - 0.05 * r)} Q ${num(mouthX)} ${num(mouthY + 0.24 * r)} ${num(mouthX + mw)} ${num(mouthY - 0.05 * r)} Z" fill="${color}" ${''}/>`;
      extra = brow(0, 0.16 * r);
      break;
    case 'surpreso':
      mouth = `<circle cx="${num(mouthX)}" cy="${num(mouthY)}" r="${num(0.14 * r)}" ${stroke}/>`;
      break;
    case 'tonto':
      extra = `<line x1="${num(eyeX - 0.1 * r)}" y1="${num(eyeY - 0.1 * r)}" x2="${num(eyeX + 0.1 * r)}" y2="${num(eyeY + 0.1 * r)}" ${stroke}/><line x1="${num(eyeX - 0.1 * r)}" y1="${num(eyeY + 0.1 * r)}" x2="${num(eyeX + 0.1 * r)}" y2="${num(eyeY - 0.1 * r)}" ${stroke}/>`;
      break;
  }
  const eyeEl = expression === 'tonto' ? '' : eye;
  return `<g transform="translate(${num(cx)} ${num(cy)}) rotate(${num(rot)})">${nose}${eyeEl}${extra}${mouth}</g>`;
}

// Renderiza APENAS a figura do personagem (sem fundo/legenda), já posicionada
// pelo `skel`. Retorna { figure, fx } — fx são as partículas do surto (atrás/à
// frente) para o caller ordenar. `flipWidth` é a largura usada no espelhamento.
function renderFigure(skel, options = {}) {
  const c = skel.character;
  const color = options.color ?? c.color ?? '#111111';
  const isDark = options.dark ?? false;
  const expression = options.expression ?? 'neutro';
  const lean = options.lean ?? 0;
  const surto = options.surto ?? 0;
  const phase = options.phase ?? 0;
  const flipWidth = options.flipWidth ?? 400;
  const hc = skel.points.headCenter;

  const lines = skel.segments
    .map(([p1, p2]) => `<line x1="${num(p1.x)}" y1="${num(p1.y)}" x2="${num(p2.x)}" y2="${num(p2.y)}"/>`)
    .join('');
  const dots = skel.dots
    .map((p) => `<circle cx="${num(p.x)}" cy="${num(p.y)}" r="${c.jointRadius}" fill="${color}"/>`)
    .join('');

  const headFill = isDark ? '#f6efe1' : 'none';
  let halo = '';
  if (isDark) {
    const haloW = c.lineWidth + 7;
    halo =
      `<g stroke="#ffffff" stroke-width="${haloW}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.92">${lines}</g>` +
      `<circle cx="${num(hc.x)}" cy="${num(hc.y)}" r="${c.headRadius}" fill="#ffffff" stroke="#ffffff" stroke-width="${haloW}"/>` +
      skel.dots.map((p) => `<circle cx="${num(p.x)}" cy="${num(p.y)}" r="${c.jointRadius + haloW / 2}" fill="#ffffff"/>`).join('');
  }
  const head = `<circle cx="${num(hc.x)}" cy="${num(hc.y)}" r="${c.headRadius}" fill="${headFill}" stroke="${color}" stroke-width="${c.lineWidth}"/>`;

  const isProfile = c.view === 'lado';
  const face =
    c.showFace === false
      ? ''
      : isProfile
        ? profileFaceSVG(hc.x, hc.y, c.headRadius, expression, lean, color, c.lineWidth)
        : faceToSVG(hc.x, hc.y, c.headRadius, expression, lean, color, c.lineWidth);

  const prop =
    c.prop && c.prop !== 'none'
      ? propSVG(skel.points.handR.x, skel.points.handR.y, c.headRadius * 0.8, c.prop)
      : '';
  const outfit = c.outfit && c.outfit !== 'nenhum' ? c.outfit : c.jacket ? 'paleto' : 'nenhum';
  const outfitColor = c.outfitColor || c.jacketColor || '#2c3e50';
  const clothes = outfit !== 'nenhum'
    ? outfitSVG(outfit, skel.points.neck, skel.points.hip, c.headRadius, c.thigh, outfitColor)
    : '';
  const tie = c.tie ? tieSVG(skel.points.neck, skel.points.hip, c.headRadius, c.tieColor || '#c0392b') : '';
  const hair = c.hair ? hairSVG(c.hairStyle || 'curto', hc.x, hc.y, c.headRadius, c.hairColor || '#20140a', lean, c.lineWidth) : { back: '', front: '' };

  const inner =
    halo +
    `<g stroke="${color}" stroke-width="${c.lineWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">${lines}</g>` +
    clothes + tie + hair.back + head + hair.front + face + dots + prop;
  const flip = isProfile && c.facing === 'esq';
  // Espelha em torno do próprio eixo do personagem (hip.x), para funcionar
  // também quando há vários personagens fora do centro.
  const pivot = skel.points.hip.x;
  const figure = flip ? `<g transform="translate(${num(2 * pivot)} 0) scale(-1 1)">${inner}</g>` : inner;
  const fx = surtoLayer(hc.x, hc.y, c.headRadius, surto, phase);
  return { figure, fx };
}

// Gera a string SVG de UM personagem (uso principal).
export function poseToSVG(pose, character, options = {}) {
  const width = options.width ?? 400;
  const height = options.height ?? 500;
  const bg = options.background ?? 'white';
  const skel = buildSkeleton(pose, character, width, height, options.originX);
  const c = skel.character;
  const isDark = DARK_BACKGROUNDS.includes(bg);
  const { defs, rect } = backgroundSVG(bg, width, height, options.scroll ?? 0);

  const { figure, fx } = renderFigure(skel, {
    color: options.color,
    dark: isDark,
    expression: options.expression ?? 'neutro',
    lean: normalizePose(pose).spineLean,
    surto: options.surto ?? 0,
    phase: options.phase ?? 0,
    flipWidth: width,
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    (defs ? `<defs>${defs}</defs>` : '') +
    rect + fx.back + figure + fx.front +
    captionSVG(options.caption, width) + titleSVG(options.title, width, height) +
    `</svg>`
  );
}

// Compõe uma CENA com vários personagens no mesmo quadro (para diálogos).
// scene = {
//   width, height, background, scroll,
//   caption, title,
//   figuras: [{ pose, character, expression, originX, color, surto }]
// }
export function composeScene(scene = {}) {
  const width = scene.width ?? 400;
  const height = scene.height ?? 500;
  const bg = scene.background ?? 'white';
  const isDark = DARK_BACKGROUNDS.includes(bg);
  const { defs, rect } = backgroundSVG(bg, width, height, scene.scroll ?? 0);

  let backLayer = '';
  let midLayer = '';
  let frontLayer = '';
  for (const f of scene.figuras || []) {
    const skel = buildSkeleton(f.pose, f.character, width, height, f.originX);
    const { figure, fx } = renderFigure(skel, {
      color: f.color,
      dark: isDark,
      expression: f.expression ?? 'neutro',
      lean: normalizePose(f.pose).spineLean,
      surto: f.surto ?? 0,
      phase: scene.phase ?? 0,
      flipWidth: width,
    });
    backLayer += fx.back;
    midLayer += figure;
    frontLayer += fx.front;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    (defs ? `<defs>${defs}</defs>` : '') +
    rect + backLayer + midLayer + frontLayer +
    captionSVG(scene.caption, width) + titleSVG(scene.title, width, height) +
    `</svg>`
  );
}
