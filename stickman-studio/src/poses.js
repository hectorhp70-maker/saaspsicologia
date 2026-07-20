// poses.js
// Biblioteca de poses nomeadas (JSON). Cada pose é apenas um conjunto de ângulos,
// independente das proporções do personagem — assim a mesma pose serve para
// qualquer esqueleto.
//
// Para ADICIONAR uma nova pose fixa: copie um bloco abaixo, dê um `id` único e
// ajuste os ângulos (veja a convenção em skeleton.js). Poses criadas pela
// interface são salvas no localStorage (ver storage.js) e não precisam mexer
// aqui.

export const defaultPoses = [
  {
    id: 'idle',
    nome: 'Parado (idle)',
    angles: { spineLean: 0, shoulderL: -12, elbowL: 8, shoulderR: 12, elbowR: -8, hipL: -8, kneeL: 5, hipR: 8, kneeR: 5 },
  },
  {
    id: 'wave',
    nome: 'Acenando',
    angles: { spineLean: 0, shoulderL: -12, elbowL: 10, shoulderR: 150, elbowR: 40, hipL: -8, kneeL: 5, hipR: 8, kneeR: 5 },
  },
  {
    id: 'walk',
    nome: 'Caminhando',
    angles: { spineLean: 5, shoulderL: 25, elbowL: 15, shoulderR: -25, elbowR: 15, hipL: 22, kneeL: 10, hipR: -22, kneeR: 30 },
  },
  {
    id: 'run',
    nome: 'Correndo',
    angles: { spineLean: 20, shoulderL: 60, elbowL: 80, shoulderR: -50, elbowR: 80, hipL: 45, kneeL: 20, hipR: -35, kneeR: 90 },
  },
  {
    id: 'jump',
    nome: 'Pulando',
    angles: { spineLean: 0, shoulderL: -150, elbowL: -20, shoulderR: 150, elbowR: 20, hipL: -25, kneeL: 45, hipR: 25, kneeR: 45 },
  },
  {
    id: 'point',
    nome: 'Apontando',
    angles: { spineLean: 0, shoulderL: -12, elbowL: 10, shoulderR: 90, elbowR: 0, hipL: -8, kneeL: 5, hipR: 8, kneeR: 5 },
  },
  {
    id: 'shrug',
    nome: 'Dando de ombros',
    angles: { spineLean: 0, shoulderL: -50, elbowL: -90, shoulderR: 50, elbowR: 90, hipL: -8, kneeL: 5, hipR: 8, kneeR: 5 },
  },
  {
    id: 'sit',
    nome: 'Sentado',
    angles: { spineLean: -5, shoulderL: 20, elbowL: 30, shoulderR: -20, elbowR: 30, hipL: 85, kneeL: 90, hipR: 75, kneeR: 90 },
  },
  {
    id: 'think',
    nome: 'Pensando',
    angles: { spineLean: -3, shoulderL: -15, elbowL: 10, shoulderR: 30, elbowR: 120, hipL: -8, kneeL: 5, hipR: 8, kneeR: 5 },
  },
];

// Retorna uma cópia profunda dos ângulos de uma pose.
export function cloneAngles(angles) {
  return { ...angles };
}
