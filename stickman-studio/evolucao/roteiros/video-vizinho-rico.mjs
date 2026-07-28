// Humor — "A síndrome do vizinho rico" (comparação social / status)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-vizinho-rico',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'rua', titulo: 'A síndrome do vizinho rico', leg: 'O carro novo dele te tirou o sono. Por quê?' },
    { tipo: 'fala', dur: 3000, cena: 'rua', expr: 'neutro', g: G.APONTA, leg: 'O carro do vizinho não é problema seu (de verdade).' },
    { tipo: 'fala', dur: 2800, cena: 'shopping', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: 'Comparação social: gastar pra “empatar” com quem você nem conhece.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'preocupado', g: G.REFLETE, leg: 'A vitrine do vizinho esconde a fatura dele.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Você comprou o carro… e a inveja veio de brinde. SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Corra a SUA corrida. As outras não têm a sua meta.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Rico é quem dorme tranquilo, não quem aparenta.' },
  ],
});
