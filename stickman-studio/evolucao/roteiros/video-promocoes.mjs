// Tema — "A psicologia das promoções" (ancoragem, escassez, FOMO, frete grátis)
// Cenários: shopping / mercado / rua (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-promocoes',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'shopping', titulo: 'A armadilha das promoções', leg: 'Por que “desconto” faz você gastar MAIS?' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: '“De R$200 por R$99”: a âncora te faz achar barato.' },
    { tipo: 'fala', dur: 3000, cena: 'mercado', expr: 'preocupado', g: G.REFLETE, leg: 'Escassez e contagem regressiva criam pressa (FOMO).' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Desconto no que você não ia comprar é gasto, não economia.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Frete grátis: você gasta mais só para “economizar” o frete.' },
    { tipo: 'fala', dur: 2800, cena: 'mercado', expr: 'neutro', g: G.APONTA, leg: 'Faça a lista ANTES; compre só o que já queria.' },
    { tipo: 'fala', dur: 3200, cena: 'shopping', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Promoção boa é a que você planejou.' },
  ],
});
