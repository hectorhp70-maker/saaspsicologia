// Humor — "Compras da madrugada" (autocontrole / decisão sob cansaço)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-madrugada',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'noite', titulo: 'Compras da madrugada', leg: 'O carrinho enche quando a razão vai dormir.' },
    { tipo: 'fala', dur: 3000, cena: 'quarto', expr: 'tonto', g: G.REFLETE, leg: '3h da manhã: seu autocontrole foi deitar mais cedo.' },
    { tipo: 'fala', dur: 2800, cena: 'quarto', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: 'Cansado, o cérebro troca “precisar” por “clicar”.' },
    { tipo: 'fala', dur: 2800, cena: 'noite', expr: 'preocupado', g: G.APONTA, leg: 'Frete grátis + insônia = carrinho lotado.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'O pacote chega e você nem lembra ter pedido. SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'casa', leg: 'Tire o cartão salvo do app. Durma com a decisão.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'O que é urgente às 3h quase nunca é de manhã.' },
  ],
});
