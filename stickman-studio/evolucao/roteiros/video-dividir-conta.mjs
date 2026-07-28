// Humor — "Dividir a conta do rodízio" (aversão à perda / free rider)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-dividir-conta',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'Racha igual?', leg: 'A pergunta que gela qualquer mesa.' },
    { tipo: 'fala', dur: 3000, cena: 'cafe', expr: 'surpreso', g: G.APONTA, leg: 'Você pediu água; ele, lagosta. “Divide por igual?”' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'bravo', g: G.REFLETE, leg: 'Aversão à perda: ninguém quer pagar a mais.' },
    { tipo: 'fala', dur: 2800, cena: 'rua', expr: 'tonto', g: G.APONTA, leg: 'O silêncio quando a conta chega… é científico.' },
    { tipo: 'fala', dur: 2600, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: '“Racha igual” e lá se foi o seu orçamento. SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Peça a conta separada — sem culpa nenhuma.' },
    { tipo: 'fala', dur: 3200, cena: 'cafe', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Combinar antes evita o teatro do fim.' },
  ],
});
