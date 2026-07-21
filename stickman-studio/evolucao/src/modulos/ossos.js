// modulos/ossos.js
// Sistema de ossos (Bone System) com hierarquia pai→filho e cinemática direta (FK).
//
// Cada osso tem: nome, pai, comprimento (base), ângulo (relativo ao pai) e
// constraints (min/max) para nunca gerar poses quebradas. A posição no mundo é
// calculada percorrendo a árvore a partir da raiz.
//
// Convenção de ângulos: graus, 0 = para a direita, cresce no sentido horário
// (y para baixo, como em canvas). dir(a) = (cos, sin).

const D2R = Math.PI / 180;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Osso {
  /**
   * @param {string} nome
   * @param {object} opts { pai, grupo, comprimento, angulo, min, max }
   */
  constructor(nome, { pai = null, grupo = 'geral', comprimento = 40, angulo = 0, min = -180, max = 180 } = {}) {
    this.nome = nome;
    this.pai = pai;         // nome do osso pai (string) ou null (raiz)
    this.grupo = grupo;     // grupo de proporção (tronco, cabeca, bracoSup, ...)
    this.comprimento = comprimento; // comprimento BASE (antes das proporções)
    this.angulo = angulo;   // ângulo relativo ao pai (o "rig")
    this.min = min;
    this.max = max;
    // preenchidos pela FK:
    this.worldStart = { x: 0, y: 0 };
    this.worldEnd = { x: 0, y: 0 };
    this.worldAngle = 0;
  }
  anguloValido() { return clamp(this.angulo, this.min, this.max); }
}

export class Esqueleto {
  constructor(ossos = []) {
    this.ossos = new Map();       // nome -> Osso
    this.ordem = [];              // ordem topológica (pais antes de filhos)
    ossos.forEach((o) => this.adicionar(o));
  }
  adicionar(osso) {
    this.ossos.set(osso.nome, osso);
    this._recalcularOrdem();
    return osso;
  }
  get(nome) { return this.ossos.get(nome); }
  clone() {
    const copia = new Esqueleto();
    for (const o of this.ossos.values()) {
      const n = new Osso(o.nome, { ...o });
      copia.ossos.set(n.nome, n);
    }
    copia._recalcularOrdem();
    return copia;
  }
  _recalcularOrdem() {
    // ordena de modo que todo pai apareça antes dos filhos
    const visitados = new Set();
    const ordem = [];
    const visitar = (nome) => {
      const o = this.ossos.get(nome);
      if (!o || visitados.has(nome)) return;
      if (o.pai) visitar(o.pai);
      visitados.add(nome);
      ordem.push(nome);
    };
    for (const nome of this.ossos.keys()) visitar(nome);
    this.ordem = ordem;
  }

  /**
   * Cinemática direta: calcula worldStart/End de todos os ossos.
   * @param {object} origem  ponto da raiz (pelve)
   * @param {object} proporcoes  multiplicadores por grupo (ver proporcoes.js)
   */
  fk(origem = { x: 0, y: 0 }, proporcoes = {}) {
    for (const nome of this.ordem) {
      const o = this.ossos.get(nome);
      const escala = proporcoes[o.grupo] ?? 1;
      const comp = o.comprimento * escala;
      if (!o.pai) {
        o.worldStart = { x: origem.x, y: origem.y };
        o.worldAngle = o.anguloValido();
      } else {
        const pai = this.ossos.get(o.pai);
        o.worldStart = { x: pai.worldEnd.x, y: pai.worldEnd.y };
        o.worldAngle = pai.worldAngle + o.anguloValido();
      }
      const r = o.worldAngle * D2R;
      o.worldEnd = { x: o.worldStart.x + Math.cos(r) * comp, y: o.worldStart.y + Math.sin(r) * comp };
    }
    return this;
  }

  // Lista de segmentos [ {a, b, grupo, osso} ] após a FK — usado por render/IK/métricas.
  segmentos() {
    const segs = [];
    for (const nome of this.ordem) {
      const o = this.ossos.get(nome);
      if (o.comprimento <= 0) continue; // raiz de comprimento 0 não desenha
      segs.push({ a: o.worldStart, b: o.worldEnd, grupo: o.grupo, osso: o });
    }
    return segs;
  }
  // Juntas (pontos) para IK e desenho de articulações.
  juntas() {
    const pts = new Map();
    for (const o of this.ossos.values()) pts.set(o.nome, o.worldEnd);
    return pts;
  }
}
