// characters.js
// Personagens (esqueletos) com proporções customizáveis. A mesma pose serve para
// qualquer personagem, pois poses guardam só ângulos.

import { defaultCharacter } from './skeleton.js';

// Presets base. Clone `defaultCharacter` e mude as proporções para criar novos.
export const defaultCharacters = [
  { ...defaultCharacter },
  {
    ...defaultCharacter,
    id: 'anderson-exec',
    nome: 'Anderson Executivo',
    hair: true,
    hairStyle: 'curto',
    hairColor: '#20140a',
    tie: true,
    tieColor: '#c0392b',
    outfit: 'paleto',
    outfitColor: '#2c3e50',
  },
  {
    ...defaultCharacter,
    id: 'ana-poupanca',
    nome: 'Ana Poupança',
    headRadius: 32,
    hair: true,
    hairStyle: 'longo',
    hairColor: '#5a3312',
    outfit: 'vestido',
    outfitColor: '#a3406b',
  },
  {
    ...defaultCharacter,
    id: 'ana-executiva',
    nome: 'Ana Executiva',
    headRadius: 32,
    hair: true,
    hairStyle: 'chanel',
    hairColor: '#241a12',
    outfit: 'paleto',
    outfitColor: '#33415c',
  },
  {
    ...defaultCharacter,
    id: 'jovem-casual',
    nome: 'Jovem casual',
    hair: true,
    hairStyle: 'ondulado',
    hairColor: '#2a1a0c',
    outfit: 'camiseta',
    outfitColor: '#2e8b7a',
  },
  {
    id: 'magrelo',
    nome: 'Magrelo (alto e fino)',
    headRadius: 26,
    spineLength: 110,
    upperArm: 52,
    foreArm: 52,
    thigh: 70,
    shin: 70,
    lineWidth: 5,
    jointRadius: 4,
    color: '#1b3a5b',
  },
  {
    id: 'forte',
    nome: 'Forte (baixo e robusto)',
    headRadius: 40,
    spineLength: 74,
    upperArm: 40,
    foreArm: 38,
    thigh: 50,
    shin: 48,
    lineWidth: 13,
    jointRadius: 9,
    color: '#111111',
  },
  {
    id: 'mascote-mini',
    nome: 'Mascote mini',
    headRadius: 44,
    spineLength: 60,
    upperArm: 34,
    foreArm: 32,
    thigh: 40,
    shin: 40,
    lineWidth: 10,
    jointRadius: 8,
    color: '#0f7a4f',
  },
];

// Campos numéricos editáveis + rótulo pt-BR e faixa (para a UI).
export const CHARACTER_FIELDS = [
  { key: 'headRadius', label: 'Raio da cabeça', min: 10, max: 80, step: 1 },
  { key: 'spineLength', label: 'Coluna (quadril→pescoço)', min: 40, max: 160, step: 1 },
  { key: 'upperArm', label: 'Braço (ombro→cotovelo)', min: 20, max: 100, step: 1 },
  { key: 'foreArm', label: 'Antebraço (cotovelo→mão)', min: 20, max: 100, step: 1 },
  { key: 'thigh', label: 'Coxa (quadril→joelho)', min: 20, max: 120, step: 1 },
  { key: 'shin', label: 'Canela (joelho→pé)', min: 20, max: 120, step: 1 },
  { key: 'lineWidth', label: 'Espessura do traço', min: 1, max: 24, step: 1 },
  { key: 'jointRadius', label: 'Tamanho das mãos/pés', min: 0, max: 20, step: 1 },
];

// Normaliza um personagem garantindo todos os campos (defaults do base).
export function normalizeCharacter(char) {
  return { ...defaultCharacter, ...char };
}
