// interpolate.js
// Interpolação linear entre duas poses (conjuntos de ângulos).

import { ANGLE_KEYS } from './skeleton.js';

const lerp = (a, b, t) => a + (b - a) * t;

// Gera `frames` quadros (>= 2) interpolando linearmente cada ângulo entre
// `from` e `to`. Retorna um array de objetos de ângulos.
export function interpolatePoses(from, to, frames) {
  const n = Math.max(2, Math.round(frames));
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const angles = {};
    for (const k of ANGLE_KEYS) {
      angles[k] = lerp(Number(from[k] ?? 0), Number(to[k] ?? 0), t);
    }
    out.push(angles);
  }
  return out;
}
