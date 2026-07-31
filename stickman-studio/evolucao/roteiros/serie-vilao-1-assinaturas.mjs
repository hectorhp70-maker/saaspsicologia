// Mini-série "Vilões Invisíveis do Orçamento" — Ep.1: Assinaturas fantasma
// Psicologia: viés do status quo / inércia. Formato 9:16 (Shorts).
import { gerar9x16, G } from './_runner9x16.mjs';
await gerar9x16({
  nome: 'serie-vilao-1-assinaturas',
  serie: 'VILÕES INVISÍVEIS · #1',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'casa', titulo: 'Vilão #1:\nAssinaturas', leg: 'O ladrão silencioso que você esqueceu de cancelar.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'tonto', prop: 'celular', g: G.MOSTRA, leg: 'Você paga 6 apps pra usar sempre o mesmo.' },
    { tipo: 'fala', dur: 3200, cena: 'cafe', expr: 'preocupado', g: G.REFLETE, leg: 'Psicologia: viés do status quo — manter é mais fácil que cancelar.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'R$300 por mês somem sem você ver. SURTO silencioso!' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Liste tudo e cancele as “zumbis” hoje.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Pague só pelo que você usa de verdade.' },
  ],
});
