// Tema — "O eu do futuro é um estranho" (desconto hiperbólico, começar cedo)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-aposentadoria',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'escritorio', titulo: 'O seu “eu do futuro”', leg: 'Por que é tão difícil poupar para a aposentadoria?' },
    { tipo: 'fala', dur: 3000, cena: 'banco', expr: 'surpreso', g: G.REFLETE, leg: 'O cérebro trata o “você de 70” como um ESTRANHO.' },
    { tipo: 'fala', dur: 2800, cena: 'banco', expr: 'preocupado', g: G.APONTA, leg: 'Por isso gastamos hoje e empurramos o amanhã.' },
    { tipo: 'fala', dur: 3000, cena: 'escritorio', expr: 'neutro', prop: 'nota', g: G.MOSTRA, leg: 'Começar cedo: os juros compostos fazem o trabalho pesado.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Pouco por mês, por décadas, vira patrimônio.' },
    { tipo: 'fala', dur: 2800, cena: 'escritorio', expr: 'neutro', g: G.APONTA, leg: 'Ganhou aumento? Suba o aporte junto, antes de gastar.' },
    { tipo: 'fala', dur: 3200, cena: 'escritorio', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Cuide hoje de quem você vai ser amanhã.' },
  ],
});
