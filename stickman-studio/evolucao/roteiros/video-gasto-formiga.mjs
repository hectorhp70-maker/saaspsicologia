// Tema — "O gasto formiga que come seu salário" (pequenos vazamentos, assinaturas)
// Cenários: cafe / mercado / shopping (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-gasto-formiga',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'O gasto formiga', leg: 'Os pequenos gastos invisíveis somam uma fortuna no ano.' },
    { tipo: 'fala', dur: 3000, cena: 'cafe', expr: 'surpreso', prop: 'nota', g: G.MOSTRA, leg: 'Cafezinho, delivery, aquele extra… ninguém sente na hora.' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'preocupado', g: G.REFLETE, leg: 'Assinaturas esquecidas: você paga por não usar.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'No fim do ano, o vazamento vira um rombo — e surto.' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Anote 7 dias: o vazamento aparece na hora.' },
    { tipo: 'fala', dur: 2800, cena: 'mercado', expr: 'neutro', g: G.APONTA, leg: 'Corte o que não faz falta; mantenha o que te dá prazer.' },
    { tipo: 'fala', dur: 3200, cena: 'shopping', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Formiga pequena, rombo grande. Feche a torneira.' },
  ],
});
