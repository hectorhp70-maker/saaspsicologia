// Tema 1 — "Por que você estoura o orçamento" (gasto por impulso / viés do presente)
// Cenários: mercado / shopping / casa (+ dramático no surto)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-orcamento',
  cenas: [
    { tipo: 'andar', dur: 3200, cena: 'shopping', titulo: 'Por que o orçamento estoura', leg: 'Não é falta de conta. É como o cérebro decide.' },
    { tipo: 'fala', dur: 3000, cena: 'mercado', expr: 'surpreso', prop: 'nota', g: G.MOSTRA, leg: 'O “viés do presente”: o prazer AGORA vale mais que o amanhã.' },
    { tipo: 'fala', dur: 2800, cena: 'shopping', expr: 'preocupado', g: G.REFLETE, leg: 'Cada “só dessa vez” parece pequeno — juntos, estouram o mês.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'neutro', g: G.APONTA, leg: 'Compra por impulso é emoção pedindo alívio, não necessidade.' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Regra das 24h: adie a compra por um dia.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'neutro', g: G.APONTA, leg: 'Dê um “teto” a cada categoria ANTES de gastar.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Sem plano, o fim do mês vira SURTO.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Orçamento não é prisão: é liberdade com consciência.' },
  ],
});
