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
    id: 'festa',
    nome: 'Festa (combo)',
    keyframes: [
      { angles: { spineLean: 0, shoulderL: -150, elbowL: -15, shoulderR: 150, elbowR: 15, hipL: -12, kneeL: 12, hipR: 12, kneeR: 12 }, expression: 'feliz', frames: 6 },
      { angles: { spineLean: -12, shoulderL: -160, elbowL: -10, shoulderR: 35, elbowR: -25, hipL: -20, kneeL: 8, hipR: 4, kneeR: 16 }, expression: 'feliz', frames: 6 },
      { angles: { spineLean: 0, shoulderL: -135, elbowL: -45, shoulderR: 135, elbowR: 45, hipL: -10, kneeL: 18, hipR: 10, kneeR: 6 }, expression: 'feliz', frames: 6 },
      { angles: { spineLean: 12, shoulderL: -35, elbowL: 25, shoulderR: 160, elbowR: 10, hipL: -4, kneeL: 16, hipR: 20, kneeR: 8 }, expression: 'feliz', frames: 6 },
      { angles: { spineLean: 4, shoulderL: 45, elbowL: 65, shoulderR: -45, elbowR: 65, hipL: -10, kneeL: 10, hipR: 10, kneeR: 10 }, expression: 'surpreso', frames: 6 },
      { angles: { spineLean: 0, shoulderL: -150, elbowL: -20, shoulderR: 150, elbowR: 20, hipL: -22, kneeL: 50, hipR: 22, kneeR: 50 }, expression: 'feliz', frames: 6 },
      { angles: { spineLean: -8, shoulderL: 60, elbowL: 30, shoulderR: 20, elbowR: 40, hipL: -16, kneeL: 10, hipR: 6, kneeR: 14 }, expression: 'feliz', frames: 6 },
      { angles: { spineLean: 0, shoulderL: -110, elbowL: -30, shoulderR: 110, elbowR: 30, hipL: -14, kneeL: 10, hipR: 14, kneeR: 10 }, expression: 'feliz', frames: 6 },
      { angles: { spineLean: 0, shoulderL: -150, elbowL: -15, shoulderR: 150, elbowR: 15, hipL: -12, kneeL: 12, hipR: 12, kneeR: 12 }, expression: 'feliz', frames: 6 },
    ],
  },
  {
    id: 'andar-lado',
    nome: 'Andar (perfil)',
    keyframes: [
      { angles: { spineLean: 6, shoulderL: 22, elbowL: 18, shoulderR: -22, elbowR: 18, hipL: -24, kneeL: 22, hipR: 26, kneeR: 8 }, expression: 'neutro', frames: 7 },
      { angles: { spineLean: 5, shoulderL: 6, elbowL: 14, shoulderR: -6, elbowR: 14, hipL: -6, kneeL: 55, hipR: 4, kneeR: 12 }, expression: 'neutro', frames: 7 },
      { angles: { spineLean: 6, shoulderL: -22, elbowL: 18, shoulderR: 22, elbowR: 18, hipL: 26, kneeL: 8, hipR: -24, kneeR: 22 }, expression: 'neutro', frames: 7 },
      { angles: { spineLean: 5, shoulderL: -6, elbowL: 14, shoulderR: 6, elbowR: 14, hipL: 4, kneeL: 12, hipR: -6, kneeR: 55 }, expression: 'neutro', frames: 7 },
      { angles: { spineLean: 6, shoulderL: 22, elbowL: 18, shoulderR: -22, elbowR: 18, hipL: -24, kneeL: 22, hipR: 26, kneeR: 8 }, expression: 'neutro', frames: 7 },
    ],
  },
  {
    id: 'correr-lado',
    nome: 'Correr (perfil)',
    keyframes: [
      { angles: { spineLean: 20, shoulderL: 55, elbowL: 80, shoulderR: -55, elbowR: 80, hipL: -40, kneeL: 80, hipR: 45, kneeR: 20 }, expression: 'neutro', frames: 5 },
      { angles: { spineLean: 22, shoulderL: 25, elbowL: 90, shoulderR: -20, elbowR: 90, hipL: -15, kneeL: 40, hipR: 10, kneeR: 90 }, expression: 'neutro', frames: 5 },
      { angles: { spineLean: 20, shoulderL: -55, elbowL: 80, shoulderR: 55, elbowR: 80, hipL: 45, kneeL: 20, hipR: -40, kneeR: 80 }, expression: 'neutro', frames: 5 },
      { angles: { spineLean: 22, shoulderL: -20, elbowL: 90, shoulderR: 25, elbowR: 90, hipL: 10, kneeL: 90, hipR: -15, kneeR: 40 }, expression: 'neutro', frames: 5 },
      { angles: { spineLean: 20, shoulderL: 55, elbowL: 80, shoulderR: -55, elbowR: 80, hipL: -40, kneeL: 80, hipR: 45, kneeR: 20 }, expression: 'neutro', frames: 5 },
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
