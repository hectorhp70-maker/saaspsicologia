// Mini-série "Vilões Invisíveis do Orçamento" — Ep.5: Taxas e tarifas invisíveis
// Psicologia: baixa fricção / desatenção (o automático não é questionado). 9:16.
import { gerar9x16, G } from './_runner9x16.mjs';
await gerar9x16({
  nome: 'serie-vilao-5-taxas',
  serie: 'VILÕES INVISÍVEIS · #5',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'banco', titulo: 'Vilão #5:\nTaxas invisíveis', leg: 'As tarifas que somem do extrato sem alarde.' },
    { tipo: 'fala', dur: 3000, cena: 'banco', expr: 'surpreso', prop: 'documento', g: G.MOSTRA, leg: 'Tarifa de conta, anuidade, IOF… fricção zero pra você perder.' },
    { tipo: 'fala', dur: 3200, cena: 'escritorio', expr: 'preocupado', g: G.REFLETE, leg: 'Psicologia: baixa fricção — o automático a gente não questiona.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Soma o ano e dá um mês de salário. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Revise o extrato e negocie/isente as tarifas.' },
    { tipo: 'fala', dur: 3200, cena: 'banco', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'O que você não olha, o banco cobra.' },
  ],
});
