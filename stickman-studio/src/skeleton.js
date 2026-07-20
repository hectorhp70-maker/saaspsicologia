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
};

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
export function buildSkeleton(pose, character, width = 400, height = 500) {
  const c = { ...defaultCharacter, ...character };
  const a = normalizePose(pose);

  const hip = { x: width / 2, y: height * 0.6 };

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

// Gera a string SVG da pose atual.
// options: { background: 'white'|'transparent', color, width, height }
export function poseToSVG(pose, character, options = {}) {
  const width = options.width ?? 400;
  const height = options.height ?? 500;
  const color = options.color ?? '#111111';
  const bg = options.background ?? 'white';
  const skel = buildSkeleton(pose, character, width, height);
  const c = skel.character;

  const bgRect =
    bg === 'transparent'
      ? ''
      : `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`;

  const lines = skel.segments
    .map(
      ([p1, p2]) =>
        `<line x1="${num(p1.x)}" y1="${num(p1.y)}" x2="${num(p2.x)}" y2="${num(p2.y)}"/>`
    )
    .join('');

  const dots = skel.dots
    .map((p) => `<circle cx="${num(p.x)}" cy="${num(p.y)}" r="${c.jointRadius}" fill="${color}"/>`)
    .join('');

  const head = `<circle cx="${num(skel.points.headCenter.x)}" cy="${num(
    skel.points.headCenter.y
  )}" r="${c.headRadius}" fill="none" stroke="${color}" stroke-width="${c.lineWidth}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bgRect}<g stroke="${color}" stroke-width="${c.lineWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">${lines}</g>${head}${dots}</svg>`;
}
