// Humor — "Cadê meu salário?" (viés do presente / hedonismo do dia de pagamento)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-salario-some',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'banco', titulo: 'Cadê meu salário?', leg: 'Todo mês o mesmo mistério não resolvido.' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'feliz', prop: 'cartao', g: G.MOSTRA, leg: 'Dia 5: milionário. Dia 10: consultando o saldo com medo.' },
    { tipo: 'fala', dur: 2800, cena: 'banco', expr: 'preocupado', g: G.REFLETE, leg: 'Viés do presente: o hoje grita, o fim do mês sussurra.' },
    { tipo: 'fala', dur: 2800, cena: 'shopping', expr: 'tonto', g: G.APONTA, leg: 'Você não gastou muito — gastou muitas vezes.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Aí o app do banco vira filme de terror. SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Separe as metas ANTES de o salário cair.' },
    { tipo: 'fala', dur: 3200, cena: 'banco', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Dê um destino a cada real — antes que ele suma.' },
  ],
});
