// Humor — "A conta do delivery" (dor de pagar diluída / conveniência)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-delivery',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'A conta do delivery', leg: 'Parece barato… até chegar a fatura.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: 'Cada pedido parece pequeno. A soma, não.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'tonto', g: G.APONTA, leg: 'Taxa + gorjeta + “tava com fome” = 3x o prato.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'preocupado', g: G.REFLETE, leg: 'A conveniência dilui a dor de pagar — você nem sente.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'No fim do mês, o delivery virou aluguel. SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Cozinhe 3x na semana; deixe o app pro fim de semana.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Delivery é luxo, não jantar de todo dia.' },
  ],
});
