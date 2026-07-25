// Tema 5 — "A paz da reserva de emergência" (ansiedade financeira, colchão, hábito de poupar)
// Cenários: quarto / casa / praia (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-reserva',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'casa', titulo: 'Reserva de emergência', leg: 'O melhor investimento em saúde mental é ter um colchão.' },
    { tipo: 'fala', dur: 3000, cena: 'quarto', expr: 'preocupado', g: G.REFLETE, leg: 'Viver no limite mantém o cérebro em alerta constante.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Sem reserva, qualquer imprevisto vira surto e dívida.' },
    { tipo: 'fala', dur: 3000, cena: 'banco', expr: 'neutro', prop: 'nota', g: G.MOSTRA, leg: 'A meta: de 3 a 6 meses de gastos guardados e líquidos.' },
    { tipo: 'andar', dur: 2600, cena: 'casa', leg: 'Comece pequeno: pague a si mesmo primeiro, todo mês.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'neutro', g: G.APONTA, leg: 'Automatize: transferência no dia do salário, sem pensar.' },
    { tipo: 'fala', dur: 2800, cena: 'quarto', expr: 'feliz', g: G.APONTA, leg: 'A reserva não rende status — rende SONO tranquilo.' },
    { tipo: 'fala', dur: 3200, cena: 'praia', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Segurança primeiro. Depois, o dinheiro trabalha por você.' },
  ],
});
