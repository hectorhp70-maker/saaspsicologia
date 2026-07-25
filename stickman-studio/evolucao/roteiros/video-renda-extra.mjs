// Tema — "Não dependa de uma renda só" (diversificar renda, reinvestir)
// Cenários: cafe / academia / escritorio (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-renda-extra',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'Mais de uma renda', leg: 'Depender de um salário só é um risco escondido.' },
    { tipo: 'fala', dur: 3000, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Uma renda única é um ponto único de falha — e de surto.' },
    { tipo: 'fala', dur: 3000, cena: 'escritorio', expr: 'neutro', g: G.APONTA, leg: 'Segurança não é só cortar gasto: é AUMENTAR a entrada.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'neutro', g: G.REFLETE, leg: 'Troque tempo por dinheiro — mas mire renda que escala.' },
    { tipo: 'andar', dur: 2600, cena: 'academia', leg: 'Reinvista a renda extra; não inche o padrão de vida.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'feliz', prop: 'nota', g: G.MOSTRA, leg: 'Comece pequeno, com algo que você já sabe fazer.' },
    { tipo: 'fala', dur: 3200, cena: 'escritorio', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Mais fontes de renda, menos medo.' },
  ],
});
