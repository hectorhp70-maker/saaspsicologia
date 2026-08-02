// Mini-série "Vilões Invisíveis do Orçamento" — Ep.4: Frete grátis / âncora
// Psicologia: ancoragem + aversão à perda (do frete). 9:16.
import { gerar9x16, G } from './_runner9x16.mjs';
await gerar9x16({
  nome: 'serie-vilao-4-frete-gratis',
  serie: 'VILÕES INVISÍVEIS · #4',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'shopping', titulo: 'Vilão #4:\nFrete grátis', leg: 'A “economia” que faz você gastar MAIS.' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: '“De R$200 por R$99” — a âncora te faz achar barato.' },
    { tipo: 'fala', dur: 3200, cena: 'mercado', expr: 'preocupado', g: G.REFLETE, leg: 'Psicologia: ancoragem + aversão a perder o frete.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Gastou R$50 pra “economizar” R$12 de frete. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Faça a lista antes; compre só o que já queria.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Promoção boa é a que você planejou.' },
  ],
});
