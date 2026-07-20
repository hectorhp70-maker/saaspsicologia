// effects.js
// Tema "Surto Financeiro": fundos dramáticos + camada de efeitos (dinheiro,
// moedas, cérebro, linhas de impacto, suor) ao redor da cabeça. Tudo vetorial,
// determinístico por índice (só a `phase` anima), para funcionar em SVG/PNG/WebM.

export const BACKGROUNDS = [
  { id: 'white', label: 'Branco' },
  { id: 'transparent', label: 'Transparente' },
  { id: 'dramatico', label: 'Dramático (escuro)' },
  { id: 'explosao', label: 'Explosão (raios)' },
  { id: 'rua', label: 'Cenário: Rua' },
  { id: 'parque', label: 'Cenário: Parque' },
  { id: 'escritorio', label: 'Cenário: Escritório' },
  { id: 'noite', label: 'Cenário: Cidade à noite' },
];

export const DARK_BACKGROUNDS = ['dramatico', 'explosao', 'noite'];
export const SCENARIOS = ['rua', 'parque', 'escritorio', 'noite'];

// Objetos que o personagem pode segurar na mão.
export const PROPS = [
  { id: 'none', label: 'Nenhum' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'moeda', label: 'Moeda' },
  { id: 'cartao', label: 'Cartão' },
  { id: 'celular', label: 'Celular' },
  { id: 'sacola', label: 'Sacola $' },
];

const num = (n) => Number(n.toFixed(2));

// PRNG determinístico (hash de um inteiro -> 0..1).
function rnd(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// Retorna { defs, rect } para o fundo escolhido.
export function backgroundSVG(id, w, h) {
  if (id === 'transparent') return { defs: '', rect: '' };
  if (id === 'white') {
    return { defs: '', rect: `<rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff"/>` };
  }
  if (SCENARIOS.includes(id)) return scenarioSVG(id, w, h);
  const cx = w / 2;
  const cy = h * 0.42;
  const defs = `
    <radialGradient id="bgGrad" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#3a2140"/>
      <stop offset="55%" stop-color="#1b1424"/>
      <stop offset="100%" stop-color="#070509"/>
    </radialGradient>`;
  let rect = `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#bgGrad)"/>`;
  if (id === 'explosao') {
    // raios em leque saindo do centro (efeito de impacto/manga)
    const rays = [];
    const R = Math.max(w, h);
    for (let i = 0; i < 24; i++) {
      const a0 = (i / 24) * Math.PI * 2;
      const a1 = a0 + (Math.PI * 2) / 24 / 2;
      const x0 = cx + Math.cos(a0) * R;
      const y0 = cy + Math.sin(a0) * R;
      const x1 = cx + Math.cos(a1) * R;
      const y1 = cy + Math.sin(a1) * R;
      rays.push(`<path d="M ${num(cx)} ${num(cy)} L ${num(x0)} ${num(y0)} L ${num(x1)} ${num(y1)} Z" fill="#e0452f" opacity="${i % 2 ? 0.06 : 0.11}"/>`);
    }
    rect += `<g>${rays.join('')}</g>`;
  }
  return { defs, rect };
}

// Cenários vetoriais. Chão em ~0.84h para o personagem "pisar".
function scenarioSVG(id, w, h) {
  const g = h * 0.84; // linha do chão
  const R = (x, y, ww, hh, fill) => `<rect x="${num(x)}" y="${num(y)}" width="${num(ww)}" height="${num(hh)}" fill="${fill}"/>`;
  const C = (cx, cy, r, fill) => `<circle cx="${num(cx)}" cy="${num(cy)}" r="${num(r)}" fill="${fill}"/>`;

  if (id === 'rua') {
    const defs = `<linearGradient id="skyRua" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8ecbf0"/><stop offset="100%" stop-color="#dff0fb"/></linearGradient>`;
    const bld = (x, ww, hh, fill) => R(x, g - hh, ww, hh, fill) +
      Array.from({ length: Math.floor(hh / 26) }, (_, r) =>
        Array.from({ length: Math.floor(ww / 22) }, (_, cc) => R(x + 8 + cc * 22, g - hh + 10 + r * 26, 10, 14, '#bcd3e6')).join('')
      ).join('');
    const scene =
      R(0, 0, w, h, 'url(#skyRua)') +
      C(w * 0.82, h * 0.16, 26, '#ffe9a8') +
      bld(w * 0.02, 90, 220, '#6d7f92') + bld(w * 0.3, 70, 160, '#8496a8') + bld(w * 0.62, 110, 250, '#5f7183') + bld(w * 0.86, 60, 190, '#7c8ea0') +
      R(0, g, w, h - g, '#9aa3ab') + // calçada
      R(0, g, w, 6, '#c3ccd3');
    return { defs, rect: scene };
  }

  if (id === 'parque') {
    const defs = `<linearGradient id="skyPq" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#9fd8f2"/><stop offset="100%" stop-color="#e6f6ff"/></linearGradient>`;
    const tree = (x) => R(x - 7, g - 70, 14, 74, '#7a5230') + C(x, g - 88, 40, '#4a9d5a') + C(x - 28, g - 74, 28, '#57ab66') + C(x + 28, g - 74, 28, '#57ab66');
    const scene =
      R(0, 0, w, h, 'url(#skyPq)') +
      C(w * 0.16, h * 0.16, 28, '#ffe58a') +
      C(w * 0.62, h * 0.2, 20, '#ffffff') + C(w * 0.68, h * 0.2, 24, '#ffffff') + C(w * 0.74, h * 0.2, 18, '#ffffff') +
      R(0, g, w, h - g, '#7cc36a') +
      tree(w * 0.86) + tree(w * 0.08);
    return { defs, rect: scene };
  }

  if (id === 'escritorio') {
    const scene =
      R(0, 0, w, h, '#d9cdb8') + // parede
      R(w * 0.12, h * 0.16, w * 0.34, h * 0.32, '#a9c7dd') + // janela
      R(w * 0.12, h * 0.16, w * 0.34, h * 0.32, 'none') +
      `<rect x="${num(w * 0.12)}" y="${num(h * 0.16)}" width="${num(w * 0.34)}" height="${num(h * 0.32)}" fill="none" stroke="#8a7f6b" stroke-width="6"/>` +
      `<line x1="${num(w * 0.29)}" y1="${num(h * 0.16)}" x2="${num(w * 0.29)}" y2="${num(h * 0.48)}" stroke="#8a7f6b" stroke-width="4"/>` +
      `<line x1="${num(w * 0.12)}" y1="${num(h * 0.32)}" x2="${num(w * 0.46)}" y2="${num(h * 0.32)}" stroke="#8a7f6b" stroke-width="4"/>` +
      C(w * 0.78, h * 0.34, 22, '#5aa06a') + R(w * 0.75, h * 0.34, 6, 50, '#7a5230') + // plantinha
      R(0, g, w, h - g, '#b08d5c'); // piso
    return { defs: '', rect: scene };
  }

  // noite (cidade)
  const defs = `<linearGradient id="skyNoite" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0b1030"/><stop offset="100%" stop-color="#2a2350"/></linearGradient>`;
  const stars = Array.from({ length: 30 }, (_, i) => {
    const x = ((i * 137) % w), y = ((i * 89) % (h * 0.6));
    return C(x, y, 1.4, '#ffffff');
  }).join('');
  const bld = (x, ww, hh) => R(x, g - hh, ww, hh, '#141a33') +
    Array.from({ length: Math.floor(hh / 24) }, (_, r) =>
      Array.from({ length: Math.floor(ww / 20) }, (_, cc) => (((r + cc + x) | 0) % 2 ? R(x + 6 + cc * 20, g - hh + 8 + r * 24, 8, 12, '#ffd97a') : '')).join('')
    ).join('');
  const scene =
    R(0, 0, w, h, 'url(#skyNoite)') +
    C(w * 0.8, h * 0.16, 24, '#f4f0d0') +
    stars +
    bld(w * 0.02, 90, 240) + bld(w * 0.32, 70, 180) + bld(w * 0.6, 110, 260) + bld(w * 0.85, 70, 200) +
    R(0, g, w, h - g, '#0a0d1c');
  return { defs, rect: scene };
}

// --- Símbolos vetoriais -------------------------------------------------------
function coin(x, y, s, rot) {
  return `<g transform="translate(${num(x)} ${num(y)}) rotate(${num(rot)})">
    <circle r="${num(s)}" fill="#f6c945" stroke="#a9781a" stroke-width="${num(s * 0.14)}"/>
    <circle r="${num(s * 0.72)}" fill="none" stroke="#d9a326" stroke-width="${num(s * 0.1)}"/>
    <text x="0" y="${num(s * 0.42)}" font-family="Arial, sans-serif" font-weight="bold" font-size="${num(s * 1.25)}" text-anchor="middle" fill="#7a5600">$</text>
  </g>`;
}

function bill(x, y, s, rot) {
  const w = s * 2.4;
  const h = s * 1.4;
  return `<g transform="translate(${num(x)} ${num(y)}) rotate(${num(rot)})">
    <rect x="${num(-w / 2)}" y="${num(-h / 2)}" width="${num(w)}" height="${num(h)}" rx="${num(s * 0.18)}" fill="#79c47a" stroke="#2f7d38" stroke-width="${num(s * 0.13)}"/>
    <circle r="${num(h * 0.3)}" fill="none" stroke="#2f7d38" stroke-width="${num(s * 0.1)}"/>
    <text x="0" y="${num(s * 0.36)}" font-family="Arial, sans-serif" font-weight="bold" font-size="${num(s * 0.95)}" text-anchor="middle" fill="#1f5f27">$</text>
  </g>`;
}

function brain(x, y, s, rot) {
  return `<g transform="translate(${num(x)} ${num(y)}) rotate(${num(rot)})">
    <ellipse rx="${num(s * 1.05)}" ry="${num(s * 0.85)}" fill="#f4a9c4" stroke="#c85f88" stroke-width="${num(s * 0.13)}"/>
    <path d="M ${num(-s * 0.6)} 0 Q ${num(-s * 0.3)} ${num(-s * 0.4)} 0 0 Q ${num(s * 0.3)} ${num(s * 0.4)} ${num(s * 0.6)} 0" fill="none" stroke="#c85f88" stroke-width="${num(s * 0.11)}" stroke-linecap="round"/>
    <path d="M 0 ${num(-s * 0.7)} L 0 ${num(s * 0.7)}" stroke="#c85f88" stroke-width="${num(s * 0.09)}"/>
  </g>`;
}

function sweat(x, y, s) {
  return `<path d="M ${num(x)} ${num(y - s)} Q ${num(x + s * 0.7)} ${num(y + s * 0.2)} ${num(x)} ${num(y + s * 0.6)} Q ${num(x - s * 0.7)} ${num(y + s * 0.2)} ${num(x)} ${num(y - s)} Z" fill="#5fb8ec" stroke="#2f86c0" stroke-width="${num(s * 0.14)}"/>`;
}

// Objeto na mão (centralizado em x,y, tamanho base s). Vetorial, sem rotação.
export function propSVG(x, y, s, type) {
  const g = (inner) => `<g transform="translate(${num(x)} ${num(y)})">${inner}</g>`;
  switch (type) {
    case 'moeda':
      return g(
        `<circle r="${num(s * 0.6)}" fill="#f6c945" stroke="#a9781a" stroke-width="${num(s * 0.08)}"/>` +
        `<circle r="${num(s * 0.44)}" fill="none" stroke="#d9a326" stroke-width="${num(s * 0.06)}"/>` +
        `<text x="0" y="${num(s * 0.24)}" font-family="Arial, sans-serif" font-weight="bold" font-size="${num(s * 0.72)}" text-anchor="middle" fill="#7a5600">$</text>`
      );
    case 'cartao':
      return g(
        `<rect x="${num(-s * 0.75)}" y="${num(-s * 0.5)}" width="${num(s * 1.5)}" height="${num(s)}" rx="${num(s * 0.12)}" fill="#3477c9" stroke="#1f4e8a" stroke-width="${num(s * 0.07)}"/>` +
        `<rect x="${num(-s * 0.75)}" y="${num(-s * 0.22)}" width="${num(s * 1.5)}" height="${num(s * 0.18)}" fill="#16324f"/>` +
        `<rect x="${num(-s * 0.55)}" y="${num(s * 0.12)}" width="${num(s * 0.3)}" height="${num(s * 0.22)}" rx="${num(s * 0.04)}" fill="#f6c945"/>`
      );
    case 'celular':
      return g(
        `<rect x="${num(-s * 0.42)}" y="${num(-s * 0.72)}" width="${num(s * 0.84)}" height="${num(s * 1.44)}" rx="${num(s * 0.14)}" fill="#15181f" stroke="#000" stroke-width="${num(s * 0.06)}"/>` +
        `<rect x="${num(-s * 0.32)}" y="${num(-s * 0.54)}" width="${num(s * 0.64)}" height="${num(s * 1.02)}" rx="${num(s * 0.05)}" fill="#8fd3a0"/>` +
        `<text x="0" y="${num(s * 0.12)}" font-family="Arial, sans-serif" font-weight="bold" font-size="${num(s * 0.5)}" text-anchor="middle" fill="#1f5f27">$</text>`
      );
    case 'sacola':
      return g(
        `<path d="M ${num(-s * 0.6)} ${num(-s * 0.35)} Q 0 ${num(-s * 0.75)} ${num(s * 0.6)} ${num(-s * 0.35)} L ${num(s * 0.78)} ${num(s * 0.7)} Q 0 ${num(s * 0.95)} ${num(-s * 0.78)} ${num(s * 0.7)} Z" fill="#caa24a" stroke="#8a6d24" stroke-width="${num(s * 0.07)}"/>` +
        `<path d="M ${num(-s * 0.6)} ${num(-s * 0.35)} Q 0 ${num(-s * 0.1)} ${num(s * 0.6)} ${num(-s * 0.35)}" fill="none" stroke="#8a6d24" stroke-width="${num(s * 0.07)}"/>` +
        `<text x="0" y="${num(s * 0.45)}" font-family="Arial, sans-serif" font-weight="bold" font-size="${num(s * 0.7)}" text-anchor="middle" fill="#5f4a12">$</text>`
      );
    case 'dinheiro':
    default:
      return g(
        `<rect x="${num(-s * 0.8)}" y="${num(-s * 0.48)}" width="${num(s * 1.6)}" height="${num(s * 0.96)}" rx="${num(s * 0.1)}" fill="#79c47a" stroke="#2f7d38" stroke-width="${num(s * 0.08)}"/>` +
        `<circle r="${num(s * 0.28)}" fill="none" stroke="#2f7d38" stroke-width="${num(s * 0.06)}"/>` +
        `<text x="0" y="${num(s * 0.22)}" font-family="Arial, sans-serif" font-weight="bold" font-size="${num(s * 0.6)}" text-anchor="middle" fill="#1f5f27">$</text>`
      );
  }
}

// Camada de "surto" em volta da cabeça. Retorna { back, front }:
//   back  = linhas de impacto (atrás do personagem)
//   front = dinheiro/moedas/cérebro/suor (na frente)
// intensity: 0..10 · phase: 0..1 (anima o flutuar/rodar)
export function surtoLayer(cx, cy, r, intensity, phase) {
  if (!intensity || intensity <= 0) return { back: '', front: '' };
  const inten = Math.min(10, intensity);
  const TAU = Math.PI * 2;

  // Linhas de impacto (choque estilo mangá).
  const nLines = Math.round(inten * 1.2);
  const lines = [];
  for (let i = 0; i < nLines; i++) {
    const a = (i / nLines) * TAU + phase * 0.6;
    const inner = r * 1.15;
    const outer = r * (1.5 + rnd(i) * 0.8);
    const x0 = cx + Math.cos(a) * inner;
    const y0 = cy + Math.sin(a) * inner;
    const x1 = cx + Math.cos(a) * outer;
    const y1 = cy + Math.sin(a) * outer;
    lines.push(`<line x1="${num(x0)}" y1="${num(y0)}" x2="${num(x1)}" y2="${num(y1)}" stroke="#e0452f" stroke-width="${num(r * 0.08)}" stroke-linecap="round" opacity="0.85"/>`);
  }

  // Partículas (dinheiro/moeda/cérebro) numa nuvem acima/ao redor da cabeça.
  const nP = Math.round(inten * 2.2);
  const parts = [];
  for (let i = 0; i < nP; i++) {
    const ang = i * 2.399963 + rnd(i) * 0.6; // ângulo áureo p/ espalhar
    const baseDist = r * (1.55 + rnd(i + 1) * 1.7);
    const bob = Math.sin(phase * TAU + i * 1.3) * r * 0.28;
    const dist = baseDist + bob;
    const px = cx + Math.cos(ang) * dist;
    const py = cy + Math.sin(ang) * dist * 0.92 - r * 0.55; // puxa p/ cima
    const size = r * (0.26 + rnd(i + 2) * 0.2);
    const rot = rnd(i + 3) * 60 - 30 + phase * 140 * (rnd(i + 4) > 0.5 ? 1 : -1);
    const t = rnd(i + 5);
    if (t < 0.42) parts.push(bill(px, py, size, rot));
    else if (t < 0.78) parts.push(coin(px, py, size, rot));
    else parts.push(brain(px, py, size, rot));
  }

  // Gotas de suor quando a intensidade é alta.
  const drops = [];
  if (inten >= 4) {
    const bob = Math.sin(phase * TAU) * r * 0.1;
    drops.push(sweat(cx - r * 0.95, cy - r * 0.35 + bob, r * 0.22));
    drops.push(sweat(cx + r * 0.98, cy - r * 0.15 - bob, r * 0.2));
  }

  return {
    back: `<g>${lines.join('')}</g>`,
    front: `<g>${parts.join('')}${drops.join('')}</g>`,
  };
}
