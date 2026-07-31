// Mini-série "Vilões Invisíveis do Orçamento" — Ep.3: Gasto formiga
// Psicologia: contabilidade mental (negligência do "pequeno"). 9:16.
import { gerar9x16, G } from './_runner9x16.mjs';
await gerar9x16({
  nome: 'serie-vilao-3-gasto-formiga',
  serie: 'VILÕES INVISÍVEIS · #3',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'Vilão #3:\nGasto formiga', leg: 'Pequeno, invisível… e devora o seu mês.' },
    { tipo: 'fala', dur: 3000, cena: 'cafe', expr: 'surpreso', prop: 'nota', g: G.MOSTRA, leg: 'Cafezinho, taxa, aquele extra: ninguém sente na hora.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'tonto', g: G.REFLETE, leg: 'Psicologia: contabilidade mental — a gente ignora o que é “pequeno”.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'No ano, viram um rombo enorme. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Anote 7 dias: o vazamento aparece na hora.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Formiga pequena, rombo grande. Feche a torneira.' },
  ],
});
