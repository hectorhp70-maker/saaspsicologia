// engine.js
// Constrói um esqueleto pronto (com FK aplicada) a partir de um MODELO.
//
// Um Modelo é o "DNA" serializável do boneco:
// {
//   proporcoes: {grupo: escala},        // proporções modulares
//   pose: {osso: deltaAngulo},          // ajustes de ângulo (rig)
//   estilo: {grossura, junta, cor, mostrarOssos},
//   nivel: 1..10,                        // nível de evolução (anexos)
//   nota: 0..100, metricas: {...},
//   nome, id
// }

import { criarEsqueleto, RAIO_CABECA_BASE } from './modulos/membros.js';
import { proporcoesBase } from './modulos/proporcoes.js';

export function modeloVazio() {
  return {
    id: 'm' + Math.random().toString(36).slice(2, 8),
    nome: 'Modelo',
    proporcoes: proporcoesBase(),
    pose: {},
    estilo: { grossura: 8, junta: 'arredondada', cor: '#141821', mostrarOssos: false, cor2: '#2f6bff' },
    nivel: 1,
    anexos: { chapeu: false, capa: false, cinto: false, olhos: true, arma: false },
    nota: 0,
    metricas: {},
  };
}

// Retorna { esqueleto (com FK), raioCabeca, origem } para render/métricas.
export function construir(modelo, origem = { x: 0, y: 0 }) {
  const esq = criarEsqueleto();
  // aplica ajustes de pose (delta) sobre o ângulo base de cada osso
  for (const [nome, delta] of Object.entries(modelo.pose || {})) {
    const o = esq.get(nome);
    if (o) o.angulo += delta;
  }
  esq.fk(origem, modelo.proporcoes);
  const raioCabeca = RAIO_CABECA_BASE * (modelo.proporcoes.cabeca ?? 1);
  return { esqueleto: esq, raioCabeca, origem };
}

// Bounding box de todos os pontos relevantes (para centralizar/enquadrar).
export function limites(construido) {
  const { esqueleto, raioCabeca } = construido;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const push = (p) => { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); };
  for (const o of esqueleto.ossos.values()) { push(o.worldStart); push(o.worldEnd); }
  const cab = esqueleto.get('cabeca').worldEnd;
  push({ x: cab.x - raioCabeca, y: cab.y - raioCabeca });
  push({ x: cab.x + raioCabeca, y: cab.y + raioCabeca });
  return { minX, minY, maxX, maxY, largura: maxX - minX, altura: maxY - minY };
}
