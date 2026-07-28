// Humor — "O amigo que some na hora do PIX" (reciprocidade / custo social de cobrar)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-pix-amigo',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'O amigo do PIX', leg: 'Todo grupo tem um. Talvez seja você.' },
    { tipo: 'fala', dur: 3000, cena: 'cafe', expr: 'surpreso', g: G.APONTA, leg: 'A conta chega… e ele vai “no banheiro”.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'preocupado', g: G.REFLETE, leg: 'Cobrar dá aquele constrangimento — e a gente engole.' },
    { tipo: 'fala', dur: 2800, cena: 'rua', expr: 'tonto', g: G.APONTA, leg: 'Cada “depois te pago” é um empréstimo que você não quis dar.' },
    { tipo: 'fala', dur: 2600, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Dez “te pago amanhã” depois… SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Combine o racha ANTES de pedir a mesa.' },
    { tipo: 'fala', dur: 3200, cena: 'cafe', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Amizade e dinheiro combinam — com combinado claro.' },
  ],
});
