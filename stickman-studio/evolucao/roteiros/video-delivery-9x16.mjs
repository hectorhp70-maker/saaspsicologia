// "A conta do delivery" — versão 9:16 (Shorts/Reels). Usa o runner vertical.
import { gerar9x16, G } from './_runner9x16.mjs';
await gerar9x16({
  nome: 'video-delivery-9x16',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'A conta do\ndelivery', leg: 'Parece barato… até chegar a fatura.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: 'Cada pedido parece pequeno. A soma, não.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'tonto', g: G.APONTA, leg: 'Taxa + gorjeta + “tava com fome” = 3x o prato.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'preocupado', g: G.REFLETE, leg: 'A conveniência dilui a dor de pagar — você nem sente.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'No fim do mês, o delivery virou aluguel. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Cozinhe 3x na semana; deixe o app pro fim de semana.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Delivery é luxo, não jantar de todo dia.' },
  ],
});
