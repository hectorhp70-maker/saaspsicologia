// Mini-série "Vilões Invisíveis do Orçamento" — Ep.2: Compra por impulso
// Psicologia: viés do presente / gratificação imediata (Sistema 1). 9:16.
import { gerar9x16, G } from './_runner9x16.mjs';
await gerar9x16({
  nome: 'serie-vilao-2-impulso',
  serie: 'VILÕES INVISÍVEIS · #2',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'shopping', titulo: 'Vilão #2:\nCompra por impulso', leg: 'O clique que o cérebro dá antes de você pensar.' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: '“Só dessa vez” — e o carrinho enche sozinho.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'preocupado', g: G.REFLETE, leg: 'Psicologia: viés do presente — o prazer agora vence o amanhã.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'A fatura chega e o “mereço” vira “como assim?”. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Regra das 24h: adie a compra por um dia.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Desejo que espera 1 dia quase sempre some.' },
  ],
});
