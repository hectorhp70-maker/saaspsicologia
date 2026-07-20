// effects.js
// Tema "Surto Financeiro": fundos dramáticos + camada de efeitos (dinheiro,
// moedas, cérebro, linhas de impacto, suor) ao redor da cabeça. Tudo vetorial,
// determinístico por índice (só a `phase` anima), para funcionar em SVG/PNG/WebM.

export const BACKGROUNDS = [
  { id: 'white', label: 'Branco' },
  { id: 'transparent', label: 'Transparente' },
  { id: 'dramatico', label: 'Dramático (escuro)' },
  { id: 'explosao', label: 'Explosão (raios)' },
];

export const DARK_BACKGROUNDS = ['dramatico', 'explosao'];

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
