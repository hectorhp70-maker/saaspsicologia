// Humor — "O terror do boleto" (evitação / efeito avestruz)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-boleto',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'casa', titulo: 'O terror do boleto', leg: 'Chegou o boleto. E começou o suspense.' },
    { tipo: 'fala', dur: 3000, cena: 'quarto', expr: 'surpreso', g: G.REFLETE, leg: 'Seu cérebro ao ver a fatura: “finge que não viu”.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'tonto', g: G.APONTA, leg: 'Efeito avestruz: esconder a cabeça não paga a conta.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Quanto mais você adia, mais o juro ri de você. SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Pague primeiro o que tira o seu sono.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'neutro', g: G.APONTA, leg: 'Débito automático: um susto a menos por mês.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Boleto pago é boleto que para de te assombrar.' },
  ],
});
