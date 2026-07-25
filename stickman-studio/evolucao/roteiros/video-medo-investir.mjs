// Tema 3 — "O medo que sabota seus investimentos" (aversão à perda, manada, longo prazo)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-medo-investir',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'rua', titulo: 'O medo e o seu dinheiro', leg: 'Investir mexe mais com a emoção do que com a matemática.' },
    { tipo: 'fala', dur: 3000, cena: 'banco', expr: 'preocupado', g: G.REFLETE, leg: 'Aversão à perda: perder R$100 dói o dobro de ganhar R$100.' },
    { tipo: 'fala', dur: 2800, cena: 'banco', expr: 'surpreso', g: G.APONTA, leg: 'Por medo, vendemos na baixa e compramos na alta. Ao contrário.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Seguir a manada no pânico vira prejuízo — e surto.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Tempo no mercado vence acertar o tempo do mercado.' },
    { tipo: 'fala', dur: 3000, cena: 'escritorio', expr: 'neutro', g: G.APONTA, leg: 'Juros compostos: o dinheiro trabalha enquanto você espera.' },
    { tipo: 'fala', dur: 2800, cena: 'escritorio', expr: 'neutro', g: G.APONTA, leg: 'Automatize os aportes: tira a emoção da decisão.' },
    { tipo: 'fala', dur: 3200, cena: 'escritorio', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Invista com plano, não com medo. Constância vence.' },
  ],
});
