// Tema — "Ensinar dinheiro aos filhos" (aprendizado por imitação, mesada, afeto)
// Cenários: casa / parque / mercado
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-filhos',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'parque', titulo: 'Filhos & Dinheiro', leg: 'O que seus filhos aprendem sobre dinheiro? Com você.' },
    { tipo: 'fala', dur: 3000, cena: 'mercado', expr: 'neutro', g: G.APONTA, leg: 'Criança aprende por IMITAÇÃO, não por sermão.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'feliz', prop: 'nota', g: G.MOSTRA, leg: 'A mesada é um laboratório: deixe errar com pouco.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'preocupado', g: G.REFLETE, leg: 'Cuidado: presente não substitui presença e afeto.' },
    { tipo: 'andar', dur: 2600, cena: 'parque', leg: 'Fale de dinheiro em casa sem tabu, na medida da idade.' },
    { tipo: 'fala', dur: 2800, cena: 'mercado', expr: 'neutro', g: G.APONTA, leg: 'Ensine a escolher: “isto OU aquilo”, não os dois.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Educar financeiramente é dar liberdade no futuro.' },
  ],
});
