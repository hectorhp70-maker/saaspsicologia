// modulos/anexos.js
// Gerador de ACESSÓRIOS (Anexos). Uma camada que desenha capas, chapéus, armas,
// olhos, cintos POR CIMA do esqueleto. O NÍVEL de evolução (1..10) controla a
// quantidade de detalhe geométrico: níveis baixos = formas simples; níveis altos
// = mais facetas, camadas e ornamentos.
//
// Cada gerador devolve uma lista de "primitivas" independentes do meio de saída:
//   { tipo:'poly',  pts:[[x,y],...], cor, opacidade, traco, grossura }
//   { tipo:'circ',  x, y, r, cor, opacidade, traco, grossura }
//   { tipo:'linha', a:[x,y], b:[x,y], cor, grossura }
// O render (canvas) e o export (SVG) sabem desenhar essas primitivas.

// ---- helpers de geometria ------------------------------------------------

const D2R = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;

// polígono regular / leque de N lados ao redor de (cx,cy)
function poligono(cx, cy, r, lados, giro = 0) {
  const pts = [];
  for (let i = 0; i < lados; i++) {
    const a = giro + (i / lados) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

// detalhe geométrico crescente: nível 1 → 3 lados, nível 10 → 12 lados
const facetas = (nivel) => Math.max(3, Math.round(lerp(3, 12, (nivel - 1) / 9)));

// ---- geradores por peça ---------------------------------------------------

// CABEÇA: centro do círculo e raio vêm do engine.
function olhos(ctx, nivel) {
  const { cabecaCentro: c, raioCabeca: r } = ctx;
  const dx = r * 0.38, dy = -r * 0.12, rr = Math.max(2, r * 0.11);
  const prims = [
    { tipo: 'circ', x: c.x - dx, y: c.y + dy, r: rr, cor: '#fff', traco: '#141821', grossura: 1.5 },
    { tipo: 'circ', x: c.x + dx, y: c.y + dy, r: rr, cor: '#fff', traco: '#141821', grossura: 1.5 },
    { tipo: 'circ', x: c.x - dx, y: c.y + dy, r: rr * 0.45, cor: '#141821' },
    { tipo: 'circ', x: c.x + dx, y: c.y + dy, r: rr * 0.45, cor: '#141821' },
  ];
  // A partir do nível 5, sobrancelhas marcadas (mais "caráter").
  if (nivel >= 5) {
    const sy = c.y + dy - rr * 1.7;
    prims.push({ tipo: 'linha', a: [c.x - dx - rr, sy + rr * 0.4], b: [c.x - dx + rr, sy], cor: '#141821', grossura: 2.2 });
    prims.push({ tipo: 'linha', a: [c.x + dx - rr, sy], b: [c.x + dx + rr, sy + rr * 0.4], cor: '#141821', grossura: 2.2 });
  }
  return prims;
}

function chapeu(ctx, nivel) {
  const { cabecaCentro: c, raioCabeca: r } = ctx;
  const cor = ctx.corAcento;
  const topo = c.y - r * 0.9;
  const aba = c.y - r * 0.35;
  const larguraAba = r * 1.7;
  const prims = [];
  // aba
  prims.push({ tipo: 'poly', pts: [
    [c.x - larguraAba, aba], [c.x + larguraAba, aba],
    [c.x + larguraAba * 0.82, aba + r * 0.16], [c.x - larguraAba * 0.82, aba + r * 0.16],
  ], cor, traco: '#141821', grossura: 2 });
  // copa: nível baixo = trapézio simples; níveis altos = copa facetada + faixa
  const alturaCopa = lerp(r * 0.6, r * 1.15, (nivel - 1) / 9);
  const topReal = c.y - r * 0.35 - alturaCopa;
  prims.push({ tipo: 'poly', pts: [
    [c.x - r * 0.72, aba], [c.x - r * 0.55, topReal],
    [c.x + r * 0.55, topReal], [c.x + r * 0.72, aba],
  ], cor, traco: '#141821', grossura: 2 });
  // faixa (nível >=3)
  if (nivel >= 3) {
    prims.push({ tipo: 'poly', pts: [
      [c.x - r * 0.72, aba - 2], [c.x + r * 0.72, aba - 2],
      [c.x + r * 0.66, aba - r * 0.28], [c.x - r * 0.66, aba - r * 0.28],
    ], cor: '#141821', opacidade: 0.85 });
  }
  // ornamento/emblema facetado no topo (nível >=6)
  if (nivel >= 6) {
    prims.push({ tipo: 'poly', pts: poligono(c.x, lerp(aba, topReal, 0.55), r * 0.18 * (nivel / 10 + 0.6), facetas(nivel)), cor: '#ffd23f', traco: '#141821', grossura: 1.5 });
  }
  return prims;
}

function capa(ctx, nivel) {
  // Ancorada nos ombros (topo do tronco) e caindo até a altura da pelve/pernas.
  const ombro = ctx.juntas.get('tronco'); // topo do tronco (pescoço)
  const quadril = ctx.origem;
  const cor = ctx.corAcento;
  const larg = ctx.raioCabeca * 1.6;
  const queda = (quadril.y - ombro.y) * lerp(1.05, 1.5, (nivel - 1) / 9);
  const baseY = ombro.y + queda;
  // babados na barra: mais recortes conforme o nível
  const recortes = Math.max(2, Math.round(lerp(2, 9, (nivel - 1) / 9)));
  const barra = [];
  for (let i = 0; i <= recortes; i++) {
    const t = i / recortes;
    const x = lerp(ombro.x - larg, ombro.x + larg, t);
    const dente = i % 2 === 0 ? 0 : ctx.raioCabeca * 0.35;
    barra.push([x, baseY + dente]);
  }
  const pts = [
    [ombro.x - larg * 0.5, ombro.y - 4],
    [ombro.x + larg * 0.5, ombro.y - 4],
    [ombro.x + larg, baseY],
    ...barra.reverse(),
    [ombro.x - larg, baseY],
  ];
  return [{ tipo: 'poly', pts, cor, opacidade: 0.92, traco: '#141821', grossura: 2 }];
}

function cinto(ctx, nivel) {
  // Na cintura: ponto médio do tronco.
  const tronco = ctx.osso('tronco');
  const meio = { x: lerp(tronco.worldStart.x, tronco.worldEnd.x, 0.5), y: lerp(tronco.worldStart.y, tronco.worldEnd.y, 0.5) };
  const larg = ctx.raioCabeca * 0.95, alt = ctx.raioCabeca * 0.3;
  const cor = ctx.corAcento;
  const prims = [{ tipo: 'poly', pts: [
    [meio.x - larg, meio.y - alt], [meio.x + larg, meio.y - alt],
    [meio.x + larg, meio.y + alt], [meio.x - larg, meio.y + alt],
  ], cor: '#141821' }];
  // fivela facetada (mais lados = nível maior)
  prims.push({ tipo: 'poly', pts: poligono(meio.x, meio.y, alt * 1.4, facetas(nivel)), cor, traco: '#141821', grossura: 1.5 });
  return prims;
}

function arma(ctx, nivel) {
  // Uma "espada/cetro" na mão direita (ponta do bracoInfD).
  const mao = ctx.juntas.get('bracoInfD');
  const cor = ctx.corAcento;
  const comp = ctx.raioCabeca * (1.8 + nivel * 0.12);
  const dir = { x: 0, y: -1 }; // aponta para cima
  const ponta = { x: mao.x + dir.x * comp, y: mao.y + dir.y * comp };
  const larg = ctx.raioCabeca * 0.16;
  const nx = -dir.y, ny = dir.x; // normal
  const prims = [];
  // lâmina
  prims.push({ tipo: 'poly', pts: [
    [mao.x + nx * larg, mao.y + ny * larg],
    [ponta.x, ponta.y],
    [mao.x - nx * larg, mao.y - ny * larg],
  ], cor, traco: '#141821', grossura: 1.5 });
  // guarda
  prims.push({ tipo: 'linha', a: [mao.x - nx * larg * 2.4, mao.y - ny * larg * 2.4], b: [mao.x + nx * larg * 2.4, mao.y + ny * larg * 2.4], cor: '#141821', grossura: 3.5 });
  // gema facetada no punho (nível >=4)
  if (nivel >= 4) {
    prims.push({ tipo: 'poly', pts: poligono(mao.x, mao.y + larg * 1.5, larg * 1.3, facetas(nivel)), cor: '#ff4d6d', traco: '#141821', grossura: 1 });
  }
  return prims;
}

// Mapa peça → gerador. Adicionar novos acessórios aqui.
const GERADORES = { olhos, chapeu, capa, cinto, arma };

/**
 * Gera todas as primitivas de acessórios ativos do modelo.
 * @param {object} construido  saída de engine.construir()
 * @param {object} modelo      DNA (usa modelo.anexos e modelo.nivel)
 * @returns {Array} primitivas
 */
export function gerarAnexos(construido, modelo) {
  const { esqueleto, raioCabeca, origem } = construido;
  const cabeca = esqueleto.get('cabeca');
  const ctx = {
    juntas: esqueleto.juntas(),
    osso: (n) => esqueleto.get(n),
    cabecaCentro: cabeca.worldEnd,
    raioCabeca,
    origem,
    corAcento: modelo.estilo?.cor2 || '#2f6bff',
  };
  const nivel = modelo.nivel || 1;
  const prims = [];
  // ordem de desenho: capa atrás (antes do corpo idealmente), mas aqui por cima
  const ordem = ['capa', 'cinto', 'arma', 'chapeu', 'olhos'];
  for (const peca of ordem) {
    if (modelo.anexos?.[peca] && GERADORES[peca]) {
      prims.push(...GERADORES[peca](ctx, nivel));
    }
  }
  return prims;
}

// Primitivas que devem ir ATRÁS do corpo (ex.: capa). Usado pelo render p/ camada.
export function anexosFundo(construido, modelo) {
  if (!modelo.anexos?.capa) return [];
  const { esqueleto, raioCabeca, origem } = construido;
  const ctx = {
    juntas: esqueleto.juntas(), osso: (n) => esqueleto.get(n),
    cabecaCentro: esqueleto.get('cabeca').worldEnd, raioCabeca, origem,
    corAcento: modelo.estilo?.cor2 || '#2f6bff',
  };
  return capa(ctx, modelo.nivel || 1);
}

// Só os anexos de frente (sem a capa, que vai no fundo).
export function anexosFrente(construido, modelo) {
  const todos = gerarAnexos(construido, modelo);
  // remove a capa (primeiras primitivas) — recomputa sem ela
  const semCapa = { ...modelo, anexos: { ...modelo.anexos, capa: false } };
  return gerarAnexos(construido, semCapa);
}
