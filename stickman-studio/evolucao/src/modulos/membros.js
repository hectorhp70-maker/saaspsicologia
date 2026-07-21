// modulos/membros.js
// Definição do RIG base (quais ossos existem e sua hierarquia).
//
// >>> EXTENSÍVEL <<<
// Para adicionar novos membros no futuro (cauda, asas, chifres...), basta
// adicionar entradas aqui apontando `pai` para um osso existente e definir
// `grupo` (crie o grupo em proporcoes.GRUPOS se quiser que ele evolua). O
// resto do sistema (FK, render, IK, métricas, export) funciona automaticamente.

import { Osso, Esqueleto } from './ossos.js';

// Ângulos em graus, relativos ao pai. Convenção: 0 = direita, y p/ baixo.
// A raiz (pelve) aponta "para cima" (-90) para o tronco subir.
export const RIG = [
  { nome: 'raiz', pai: null, grupo: 'raiz', comprimento: 0, angulo: -90, min: -200, max: 20 },
  { nome: 'tronco', pai: 'raiz', grupo: 'tronco', comprimento: 92, angulo: 0, min: -30, max: 30 },
  { nome: 'cabeca', pai: 'tronco', grupo: 'cabeca', comprimento: 34, angulo: 0, min: -40, max: 40 },

  // Braços (saem do topo do tronco = pescoço/ombro)
  { nome: 'bracoSupE', pai: 'tronco', grupo: 'bracoSup', comprimento: 46, angulo: -150, min: -200, max: -20 },
  { nome: 'bracoInfE', pai: 'bracoSupE', grupo: 'bracoInf', comprimento: 46, angulo: 15, min: -10, max: 160 },
  { nome: 'bracoSupD', pai: 'tronco', grupo: 'bracoSup', comprimento: 46, angulo: 150, min: 20, max: 200 },
  { nome: 'bracoInfD', pai: 'bracoSupD', grupo: 'bracoInf', comprimento: 46, angulo: -15, min: -160, max: 10 },

  // Pernas (saem da raiz/pelve)
  { nome: 'pernaSupE', pai: 'raiz', grupo: 'pernaSup', comprimento: 60, angulo: -150, min: -210, max: -60 },
  { nome: 'pernaInfE', pai: 'pernaSupE', grupo: 'pernaInf', comprimento: 60, angulo: 12, min: -5, max: 160 },
  { nome: 'pernaSupD', pai: 'raiz', grupo: 'pernaSup', comprimento: 60, angulo: 150, min: 60, max: 210 },
  { nome: 'pernaInfD', pai: 'pernaSupD', grupo: 'pernaInf', comprimento: 60, angulo: -12, min: -160, max: 5 },
];

// Juntas manipuláveis por IK (cadeia de 2 ossos → alvo = ponta).
export const CADEIAS_IK = {
  maoE: { base: 'tronco', sup: 'bracoSupE', inf: 'bracoInfE' },
  maoD: { base: 'tronco', sup: 'bracoSupD', inf: 'bracoInfD' },
  peE: { base: 'raiz', sup: 'pernaSupE', inf: 'pernaInfE' },
  peD: { base: 'raiz', sup: 'pernaSupD', inf: 'pernaInfD' },
};

// A cabeça é desenhada como círculo; este é o raio base (escala por proporção cabeca).
export const RAIO_CABECA_BASE = 30;

export function criarEsqueleto() {
  return new Esqueleto(RIG.map((d) => new Osso(d.nome, d)));
}
