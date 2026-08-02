// Tema — "Férias em família sem ressaca" (psicologia das férias + finanças + família)
// Cenários: praia / casa / banco / rua (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-ferias-familia',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'praia', titulo: 'Férias sem ressaca', leg: 'Como viajar com a família sem dívida na volta.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'feliz', g: G.APONTA, leg: 'Planejar a viagem já dá felicidade — a antecipação é metade da alegria.' },
    { tipo: 'fala', dur: 3000, cena: 'praia', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: 'No clima de férias, o bolso relaxa: “tô de férias, mereço”.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'neutro', g: G.REFLETE, leg: 'Combine o orçamento com a família: menos briga, menos surpresa.' },
    { tipo: 'fala', dur: 3000, cena: 'banco', expr: 'neutro', prop: 'nota', g: G.MOSTRA, leg: 'Um “fundo de férias” o ano todo vence parcelar tudo depois.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Senão vem a ressaca de janeiro: a conta da viagem. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Defina um teto e uma reserva pra imprevistos da viagem.' },
    { tipo: 'fala', dur: 3200, cena: 'praia', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Férias boas são as que não cobram juros depois.' },
  ],
});
