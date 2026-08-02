// Short 9:16 — "A conta oculta da balada": álcool, psicologia e finanças.
// Psicologia: miopia do álcool (reduz o autocontrole) + pressão social da rodada
// + viés do presente amplificado. Fecha com a "ressaca financeira".
import { gerar9x16, G } from './_runner9x16.mjs';
await gerar9x16({
  nome: 'video-balada',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'noite', titulo: 'A conta oculta\nda balada', leg: 'Como a noite esvazia o seu bolso sem você ver.' },
    { tipo: 'fala', dur: 3200, cena: 'noite', expr: 'feliz', prop: 'cartao', g: G.MOSTRA, leg: '"Rodada é por minha conta!" — e lá se vai metade do mês.' },
    { tipo: 'fala', dur: 3400, cena: 'noite', expr: 'tonto', g: G.REFLETE, leg: 'Psicologia: o álcool desliga o freio — miopia do álcool. O agora grita, o amanhã some.' },
    { tipo: 'fala', dur: 3000, cena: 'noite', expr: 'surpreso', prop: 'celular', g: G.MOSTRA, leg: 'Cada Pix e cada rodada parecem pequenos… juntos, não.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'No dia seguinte: ressaca + fatura. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Leve um valor fechado e pague no débito ou dinheiro.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Curta a balada — não a dívida.' },
  ],
});
