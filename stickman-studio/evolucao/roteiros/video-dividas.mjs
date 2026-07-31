// Tema 2 — "Sair das dívidas começa na cabeça" (vergonha, evitação, avestruz)
// Cenários: noite / banco / quarto (+ dramático no surto)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-dividas',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'noite', titulo: 'Dívida também é emoção', leg: 'A parte mais difícil da dívida é psicológica.' },
    { tipo: 'fala', dur: 3000, cena: 'quarto', expr: 'triste', g: G.REFLETE, leg: 'Vergonha e culpa fazem a gente FUGIR da fatura.' },
    { tipo: 'fala', dur: 2800, cena: 'quarto', expr: 'preocupado', g: G.APONTA, leg: 'É o “efeito avestruz”: não olhar para não sofrer.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Mas ignorar só faz os juros crescerem — e o surto vir.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Primeiro passo: encarar. Liste tudo, sem se julgar.' },
    { tipo: 'fala', dur: 3000, cena: 'banco', expr: 'neutro', g: G.APONTA, leg: 'Negocie: troque juro alto (cartão) por dívida mais barata.' },
    { tipo: 'fala', dur: 2800, cena: 'banco', expr: 'feliz', g: G.APONTA, leg: 'Quite as menores primeiro: cada vitória motiva a próxima.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Você não é a sua dívida. Encarar já é começar a sair.' },
  ],
});
