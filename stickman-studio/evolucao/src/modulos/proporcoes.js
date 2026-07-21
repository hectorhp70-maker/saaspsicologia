// modulos/proporcoes.js
// Proporções modulares: multiplicadores de comprimento por GRUPO de osso.
// 1.0 = comprimento base. Guardadas num objeto simples e fáceis de randomizar.

export const GRUPOS = ['tronco', 'cabeca', 'bracoSup', 'bracoInf', 'pernaSup', 'pernaInf', 'ombro'];

// Proporção neutra (ponto de partida).
export function proporcoesBase() {
  return { tronco: 1, cabeca: 1, bracoSup: 1, bracoInf: 1, pernaSup: 1, pernaInf: 1, ombro: 1 };
}

// Faixas aceitáveis por grupo (evita aberrações).
export const FAIXAS = {
  tronco: [0.7, 1.4], cabeca: [0.6, 1.8], bracoSup: [0.6, 1.5], bracoInf: [0.6, 1.5],
  pernaSup: [0.6, 1.7], pernaInf: [0.6, 1.7], ombro: [0.6, 1.6],
};

// "Espessura/estilo" e cor não são proporção, ficam no estado da UI, mas o
// arquétipo abaixo enviesa a EVOLUÇÃO (média da distribuição normal por grupo).
// Ver evolucao.js: cada perfil puxa as proporções para um "tipo" de boneco.
export const ARQUETIPOS = {
  neutro: { tronco: 1.0, cabeca: 1.0, bracoSup: 1.0, bracoInf: 1.0, pernaSup: 1.0, pernaInf: 1.0, ombro: 1.0 },
  heroico: { tronco: 1.15, cabeca: 0.85, bracoSup: 1.1, bracoInf: 1.05, pernaSup: 1.25, pernaInf: 1.25, ombro: 1.4 },
  comico: { tronco: 0.85, cabeca: 1.6, bracoSup: 0.8, bracoInf: 0.8, pernaSup: 0.75, pernaInf: 0.75, ombro: 0.8 },
};
