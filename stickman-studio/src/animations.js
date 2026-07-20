// animations.js
// Animações prontas = timelines nomeadas (sequências de quadros-chave). Cada
// quadro-chave é { angles, expression, frames }. Servem para qualquer
// personagem, pois guardam só ângulos + expressão.

import { defaultPoses } from './poses.js';

const byId = Object.fromEntries(defaultPoses.map((p) => [p.id, p]));
const a = (id) => ({ ...byId[id].angles });

// Espelha esquerda<->direita (para ciclos de caminhada/corrida em loop).
function mirror(ang) {
  return {
    spineLean: ang.spineLean,
    shoulderL: ang.shoulderR, elbowL: ang.elbowR,
    shoulderR: ang.shoulderL, elbowR: ang.elbowL,
    hipL: ang.hipR, kneeL: ang.kneeR,
    hipR: ang.hipL, kneeR: ang.kneeL,
  };
}

export const defaultAnimations = [
  {
    id: 'idle-breathe',
    nome: 'Parado (respiração)',
    keyframes: [
      { angles: a('idle'), expression: 'neutro', frames: 20 },
      { angles: { ...a('idle'), spineLean: 3, shoulderL: -16, shoulderR: 16 }, expression: 'neutro', frames: 20 },
      { angles: a('idle'), expression: 'neutro', frames: 20 },
    ],
  },
  {
    id: 'wave-hello',
    nome: 'Aceno (olá)',
    keyframes: [
      { angles: a('idle'), expression: 'neutro', frames: 10 },
      { angles: a('wave'), expression: 'feliz', frames: 8 },
      { angles: { ...a('wave'), elbowR: 75 }, expression: 'feliz', frames: 8 },
      { angles: a('wave'), expression: 'feliz', frames: 8 },
      { angles: a('idle'), expression: 'feliz', frames: 10 },
    ],
  },
  {
    id: 'walk-cycle',
    nome: 'Caminhada (loop)',
    keyframes: [
      { angles: a('walk'), expression: 'neutro', frames: 12 },
      { angles: mirror(a('walk')), expression: 'neutro', frames: 12 },
      { angles: a('walk'), expression: 'neutro', frames: 12 },
    ],
  },
  {
    id: 'run-cycle',
    nome: 'Corrida (loop)',
    keyframes: [
      { angles: a('run'), expression: 'surpreso', frames: 8 },
      { angles: mirror(a('run')), expression: 'surpreso', frames: 8 },
      { angles: a('run'), expression: 'surpreso', frames: 8 },
    ],
  },
  {
    id: 'celebrate',
    nome: 'Comemoração (pulo)',
    keyframes: [
      { angles: a('idle'), expression: 'feliz', frames: 8 },
      { angles: { spineLean: 0, shoulderL: -30, elbowL: 20, shoulderR: 30, elbowR: -20, hipL: -14, kneeL: 60, hipR: 14, kneeR: 60 }, expression: 'feliz', frames: 6 },
      { angles: a('jump'), expression: 'feliz', frames: 8 },
      { angles: a('idle'), expression: 'feliz', frames: 8 },
    ],
  },
  {
    id: 'susto',
    nome: 'Susto financeiro',
    keyframes: [
      { angles: a('idle'), expression: 'neutro', frames: 12 },
      { angles: { spineLean: -10, shoulderL: -120, elbowL: -30, shoulderR: 120, elbowR: 30, hipL: -12, kneeL: 5, hipR: 12, kneeR: 5 }, expression: 'surpreso', frames: 6 },
      { angles: a('shrug'), expression: 'preocupado', frames: 14 },
    ],
  },
  {
    id: 'think-shrug',
    nome: 'Pensar e dar de ombros',
    keyframes: [
      { angles: a('think'), expression: 'preocupado', frames: 16 },
      { angles: a('shrug'), expression: 'preocupado', frames: 12 },
      { angles: a('idle'), expression: 'neutro', frames: 12 },
    ],
  },
];

// Clona os quadros-chave de uma animação (para carregar na timeline com segurança).
export function cloneKeyframes(anim) {
  return (anim.keyframes || []).map((kf) => ({
    angles: { ...kf.angles },
    expression: kf.expression || 'neutro',
    frames: kf.frames || 12,
  }));
}
