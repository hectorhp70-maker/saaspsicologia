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
  taper: true, // traço de peso variável (orgânico) vs. linha reta
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
  { id: 'repartido', label: 'Repartido' },
  { id: 'franja', label: 'Com franja' },
  { id: 'ondulado', label: 'Ondulado' },
  { id: 'cacheado', label: 'Cacheado' },
  { id: 'moicano', label: 'Moicano' },
  { id: 'longo', label: 'Longo (feminino)' },
  { id: 'rabo', label: 'Rabo de cavalo (fem.)' },
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
  const hl = shade(color, 40); // mecha de luz (realismo)
  const strand = (d) => `<path d="${d}" fill="none" stroke="${hl}" stroke-width="${num(Math.max(1.2, r * 0.03))}" stroke-linecap="round" opacity="0.65"/>`;
  const circ = (fx, fy, fr) => `<circle cx="${num(fx * r)}" cy="${num(fy * r)}" r="${num(fr * r)}" fill="${color}" stroke="${dark}" stroke-width="1"/>`;
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
      front = wavyCap() +
        strand(`M ${num(-0.5 * r)} ${num(-0.55 * r)} Q ${num(-0.2 * r)} ${num(-0.85 * r)} ${num(0.1 * r)} ${num(-0.7 * r)}`) +
        strand(`M ${num(0.05 * r)} ${num(-0.6 * r)} Q ${num(0.35 * r)} ${num(-0.85 * r)} ${num(0.6 * r)} ${num(-0.55 * r)}`);
      break;
    case 'repartido': {
      // cap com risca lateral e varredura para os lados
      front = pth(
        `M ${num(arc(202).x)} ${num(arc(202).y)} A ${num(r)} ${num(r)} 0 0 1 ${num(arc(-22).x)} ${num(arc(-22).y)} ` +
        `Q ${num(0.35 * r)} ${num(-0.28 * r)} ${num(0.1 * r)} ${num(-0.72 * r)} ` +
        `Q ${num(-0.35 * r)} ${num(-0.32 * r)} ${num(arc(202).x)} ${num(arc(202).y)} Z`,
        color
      ) +
        strand(`M ${num(0.1 * r)} ${num(-0.72 * r)} Q ${num(-0.15 * r)} ${num(-0.5 * r)} ${num(-0.55 * r)} ${num(-0.4 * r)}`) +
        strand(`M ${num(0.12 * r)} ${num(-0.66 * r)} Q ${num(0.5 * r)} ${num(-0.5 * r)} ${num(0.78 * r)} ${num(-0.22 * r)}`);
      break;
    }
    case 'franja': {
      const cap = pth(
        `M ${num(arc(200).x)} ${num(arc(200).y)} A ${num(r)} ${num(r)} 0 0 1 ${num(arc(-20).x)} ${num(arc(-20).y)} ` +
        `Q 0 ${num(-0.45 * r)} ${num(arc(200).x)} ${num(arc(200).y)} Z`,
        color
      );
      const bangs = [-0.52, -0.26, 0, 0.26, 0.52]
        .map((fx) => {
          const x = fx * r, top = -0.78 * r, bot = -0.02 * r;
          return pth(`M ${num(x - 0.16 * r)} ${num(top)} Q ${num(x)} ${num(top - 0.06 * r)} ${num(x + 0.16 * r)} ${num(top)} L ${num(x + 0.13 * r)} ${num(bot)} Q ${num(x)} ${num(bot + 0.1 * r)} ${num(x - 0.13 * r)} ${num(bot)} Z`, color);
        })
        .join('');
      front = cap + bangs;
      break;
    }
    case 'cacheado': {
      const curls = [
        [-0.62, -0.45, 0.3], [-0.4, -0.72, 0.32], [-0.05, -0.88, 0.34], [0.32, -0.78, 0.32], [0.6, -0.5, 0.3],
        [-0.78, -0.1, 0.27], [0.78, -0.12, 0.27], [0, -0.55, 0.3], [-0.28, -0.35, 0.26], [0.3, -0.4, 0.26],
      ].map(([fx, fy, fr]) => circ(fx, fy, fr)).join('');
      front = curls;
      break;
    }
    case 'longo': {
      const fall = (s) => pth(
        `M ${num(s * 0.5 * r)} ${num(-0.55 * r)} ` +
        `C ${num(s * 1.2 * r)} ${num(-0.25 * r)} ${num(s * 1.25 * r)} ${num(0.9 * r)} ${num(s * 0.98 * r)} ${num(1.75 * r)} ` +
        `L ${num(s * 0.42 * r)} ${num(1.75 * r)} ` +
        `C ${num(s * 0.55 * r)} ${num(0.6 * r)} ${num(s * 0.5 * r)} ${num(-0.1 * r)} ${num(s * 0.25 * r)} ${num(-0.62 * r)} Z`,
        color
      );
      const sfall = (s) => strand(`M ${num(s * 0.85 * r)} ${num(-0.2 * r)} Q ${num(s * 1.05 * r)} ${num(0.7 * r)} ${num(s * 0.8 * r)} ${num(1.5 * r)}`);
      back = fall(-1) + fall(1) + sfall(-1) + sfall(1);
      front = wavyCap();
      break;
    }
    case 'rabo': {
      // rabo de cavalo atrás, à direita, subindo e caindo
      back = pth(
        `M ${num(0.7 * r)} ${num(-0.55 * r)} C ${num(1.5 * r)} ${num(-0.85 * r)} ${num(1.75 * r)} ${num(-0.05 * r)} ${num(1.35 * r)} ${num(0.6 * r)} ` +
        `C ${num(1.5 * r)} ${num(-0.05 * r)} ${num(1.2 * r)} ${num(-0.45 * r)} ${num(0.55 * r)} ${num(-0.35 * r)} Z`,
        color
      );
      front = pth(
        `M ${num(arc(200).x)} ${num(arc(200).y)} A ${num(r)} ${num(r)} 0 0 1 ${num(arc(-20).x)} ${num(arc(-20).y)} ` +
        `Q 0 ${num(-0.5 * r)} ${num(arc(200).x)} ${num(arc(200).y)} Z`,
        color
      ) + `<ellipse cx="${num(0.72 * r)}" cy="${num(-0.5 * r)}" rx="${num(0.12 * r)}" ry="${num(0.09 * r)}" fill="${dark}"/>`;
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
  const eyeDX = 0.36 * r;
  const eyeY = -0.15 * r;
  const exr = 0.11 * r, eyr = 0.145 * r; // raios do olho (oval)
  const browY = eyeY - 0.28 * r;
  const mouthY = 0.36 * r;
  const mw = 0.42 * r;
  const lw = Math.max(1.5, lineWidth * 0.5);
  const stroke = `fill="none" stroke="${color}" stroke-width="${num(lw)}" stroke-linecap="round"`;
  const strokeB = `fill="none" stroke="${color}" stroke-width="${num(lw * 1.35)}" stroke-linecap="round"`;
  const line = (x1, y1, x2, y2) => `<line x1="${num(x1)}" y1="${num(y1)}" x2="${num(x2)}" y2="${num(y2)}" ${stroke}/>`;

  // Olho oval com brilho (dá vida ao rosto).
  const eye = (x) =>
    `<ellipse cx="${num(x)}" cy="${num(eyeY)}" rx="${num(exr)}" ry="${num(eyr)}" fill="${color}"/>` +
    `<circle cx="${num(x - exr * 0.35)}" cy="${num(eyeY - eyr * 0.35)}" r="${num(exr * 0.34)}" fill="#ffffff"/>`;
  const eyes = () => eye(-eyeDX) + eye(eyeDX);
  // Olho arregalado (surpresa): anel + pupila.
  const eyeWide = (x) =>
    `<circle cx="${num(x)}" cy="${num(eyeY)}" r="${num(0.16 * r)}" fill="#ffffff" stroke="${color}" stroke-width="${num(lw)}"/>` +
    `<circle cx="${num(x)}" cy="${num(eyeY + 0.02 * r)}" r="${num(0.06 * r)}" fill="${color}"/>`;
  const eyesWide = () => eyeWide(-eyeDX) + eyeWide(eyeDX);
  // Olho feliz fechado (^).
  const eyeHappy = (x) =>
    `<path d="M ${num(x - 0.13 * r)} ${num(eyeY + 0.04 * r)} Q ${num(x)} ${num(eyeY - 0.13 * r)} ${num(x + 0.13 * r)} ${num(eyeY + 0.04 * r)}" ${strokeB}/>`;
  const eyesHappy = () => eyeHappy(-eyeDX) + eyeHappy(eyeDX);
  const eyesX = () => {
    const d = 0.11 * r;
    const one = (ex) => line(ex - d, eyeY - d, ex + d, eyeY + d) + line(ex - d, eyeY + d, ex + d, eyeY - d);
    return one(-eyeDX) + one(eyeDX);
  };

  // Sobrancelha curva, do canto externo ao interno (innerDY/outerDY em px).
  const brow = (x, innerDY, outerDY) => {
    const toCenter = x < 0 ? 1 : -1;
    const outerX = x - toCenter * 0.16 * r, innerX = x + toCenter * 0.14 * r;
    const topY = Math.min(browY + innerDY, browY + outerDY) - 0.05 * r;
    return `<path d="M ${num(outerX)} ${num(browY + outerDY)} Q ${num(x)} ${num(topY)} ${num(innerX)} ${num(browY + innerDY)}" ${strokeB}/>`;
  };
  const brows = (innerDY, outerDY) => brow(-eyeDX, innerDY, outerDY) + brow(eyeDX, innerDY, outerDY);

  const nose = `<path d="M 0 ${num(0.02 * r)} Q ${num(0.05 * r)} ${num(0.1 * r)} 0 ${num(0.13 * r)}" fill="none" stroke="${shade(color, 60)}" stroke-width="${num(lw * 0.9)}" stroke-linecap="round"/>`;
  const blush = () =>
    `<ellipse cx="${num(-0.44 * r)}" cy="${num(0.16 * r)}" rx="${num(0.11 * r)}" ry="${num(0.06 * r)}" fill="#ff8f9a" opacity="0.55"/>` +
    `<ellipse cx="${num(0.44 * r)}" cy="${num(0.16 * r)}" rx="${num(0.11 * r)}" ry="${num(0.06 * r)}" fill="#ff8f9a" opacity="0.55"/>`;
  const sweat = (x, y) => `<path d="M ${num(x)} ${num(y - 0.1 * r)} Q ${num(x + 0.07 * r)} ${num(y + 0.02 * r)} ${num(x)} ${num(y + 0.06 * r)} Q ${num(x - 0.07 * r)} ${num(y + 0.02 * r)} ${num(x)} ${num(y - 0.1 * r)} Z" fill="#5fb8ec" stroke="#2f86c0" stroke-width="${num(lw * 0.5)}"/>`;

  const smile = () => `<path d="M ${num(-mw)} ${num(mouthY)} Q 0 ${num(mouthY + 0.24 * r)} ${num(mw)} ${num(mouthY)}" ${strokeB}/>`;
  const openSmile = () =>
    `<path d="M ${num(-mw * 0.85)} ${num(mouthY - 0.02 * r)} Q 0 ${num(mouthY + 0.36 * r)} ${num(mw * 0.85)} ${num(mouthY - 0.02 * r)} Q 0 ${num(mouthY + 0.06 * r)} ${num(-mw * 0.85)} ${num(mouthY - 0.02 * r)} Z" fill="#93404a" stroke="${color}" stroke-width="${num(lw)}" stroke-linejoin="round"/>` +
    `<path d="M ${num(-mw * 0.7)} ${num(mouthY - 0.01 * r)} Q 0 ${num(mouthY + 0.03 * r)} ${num(mw * 0.7)} ${num(mouthY - 0.01 * r)}" fill="none" stroke="#ffffff" stroke-width="${num(lw * 0.8)}"/>`;
  const frown = (s = 0.18 * r) => `<path d="M ${num(-mw)} ${num(mouthY + 0.04 * r)} Q 0 ${num(mouthY - s)} ${num(mw)} ${num(mouthY + 0.04 * r)}" ${strokeB}/>`;
  const flat = () => line(-mw * 0.8, mouthY, mw * 0.8, mouthY);
  const circleMouth = (rr = 0.14 * r) => `<ellipse cx="0" cy="${num(mouthY)}" rx="${num(rr * 0.85)}" ry="${num(rr)}" fill="#7a3138" stroke="${color}" stroke-width="${num(lw)}"/>`;
  const wavy = () => `<path d="M ${num(-mw * 0.8)} ${num(mouthY)} Q ${num(-mw * 0.4)} ${num(mouthY - 0.1 * r)} 0 ${num(mouthY)} Q ${num(mw * 0.4)} ${num(mouthY + 0.1 * r)} ${num(mw * 0.8)} ${num(mouthY)}" ${stroke}/>`;

  let inner = '';
  switch (expression) {
    case 'feliz':
      inner = brows(-0.04 * r, -0.06 * r) + eyesHappy() + nose + blush() + openSmile();
      break;
    case 'triste':
      inner = brows(-0.06 * r, 0.12 * r) + eyes() + nose + frown() + sweat(-eyeDX - 0.16 * r, eyeY + 0.05 * r);
      break;
    case 'bravo':
      inner = brows(0.18 * r, -0.02 * r) + eyes() + nose + frown(0.22 * r);
      break;
    case 'surpreso':
      inner = brows(-0.14 * r, -0.14 * r) + eyesWide() + circleMouth(0.15 * r) + sweat(eyeDX + 0.18 * r, eyeY);
      break;
    case 'preocupado':
      inner = brows(-0.08 * r, 0.06 * r) + eyes() + nose + wavy() + sweat(eyeDX + 0.18 * r, eyeY);
      break;
    case 'furioso': {
      const mouthOpen =
        `<path d="M ${num(-mw)} ${num(mouthY - 0.04 * r)} Q 0 ${num(mouthY - 0.16 * r)} ${num(mw)} ${num(mouthY - 0.04 * r)} Q ${num(mw * 0.8)} ${num(mouthY + 0.32 * r)} 0 ${num(mouthY + 0.36 * r)} Q ${num(-mw * 0.8)} ${num(mouthY + 0.32 * r)} ${num(-mw)} ${num(mouthY - 0.04 * r)} Z" fill="#7a2e2e" stroke="${color}" stroke-width="${num(lw)}" stroke-linejoin="round"/>` +
        `<line x1="${num(-mw * 0.8)}" y1="${num(mouthY)}" x2="${num(mw * 0.8)}" y2="${num(mouthY)}" fill="none" stroke="#ffffff" stroke-width="${num(lw * 0.7)}"/>`;
      inner = brows(0.22 * r, -0.06 * r) + eyes() + mouthOpen;
      break;
    }
    case 'tonto':
      inner = eyesX() + circleMouth(0.12 * r);
      break;
    case 'neutro':
    default:
      inner = brows(0, 0) + eyes() + nose + flat();
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

// Membros com peso variável (tapered): grossos no núcleo (tronco/quadril),
// afinando nas extremidades (mãos/pés) — dá organicidade e sensação de vida,
// evitando linhas retas robóticas. Junções arredondadas por círculos.
function taperedLimbsSVG(p, LW, color) {
  const W = { core: LW * 1.25, neck: LW * 1.05, elbow: LW * 0.7, hand: LW * 0.42, knee: LW * 0.86, foot: LW * 0.48 };
  const seg = (a, w1, b, w2) => {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    const P = (pt, w, s) => `${num(pt.x + s * nx * w / 2)},${num(pt.y + s * ny * w / 2)}`;
    return `<polygon points="${P(a, w1, 1)} ${P(b, w2, 1)} ${P(b, w2, -1)} ${P(a, w1, -1)}" fill="${color}"/>`;
  };
  const joint = (pt, w) => `<circle cx="${num(pt.x)}" cy="${num(pt.y)}" r="${num(w / 2)}" fill="${color}"/>`;
  return (
    seg(p.hip, W.core, p.neck, W.neck) +
    seg(p.shoulder, W.neck, p.elbowLpt, W.elbow) + seg(p.elbowLpt, W.elbow, p.handL, W.hand) +
    seg(p.shoulder, W.neck, p.elbowRpt, W.elbow) + seg(p.elbowRpt, W.elbow, p.handR, W.hand) +
    seg(p.hip, W.core, p.kneeLpt, W.knee) + seg(p.kneeLpt, W.knee, p.footL, W.foot) +
    seg(p.hip, W.core, p.kneeRpt, W.knee) + seg(p.kneeRpt, W.knee, p.footR, W.foot) +
    joint(p.hip, W.core) + joint(p.neck, W.neck) +
    joint(p.elbowLpt, W.elbow) + joint(p.elbowRpt, W.elbow) +
    joint(p.kneeLpt, W.knee) + joint(p.kneeRpt, W.knee)
  );
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

  const bodyLimbs = c.taper !== false
    ? taperedLimbsSVG(skel.points, c.lineWidth, color)
    : `<g stroke="${color}" stroke-width="${c.lineWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">${lines}</g>`;
  const inner =
    halo +
    bodyLimbs +
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
