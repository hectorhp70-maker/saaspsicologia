// Tema 4 — "Comprar para impressar" (comparação social, status, inflação do estilo de vida)
// Cenários: shopping / cafe / rua (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-status',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'shopping', titulo: 'Comprar para impressar', leg: 'Quanto do seu gasto é seu — e quanto é dos outros?' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'surpreso', prop: 'cartao', g: G.MOSTRA, leg: 'Comparação social: a gente gasta para “acompanhar” os outros.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'preocupado', g: G.REFLETE, leg: 'Redes sociais mostram a vitrine, nunca a fatura.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'neutro', g: G.APONTA, leg: 'Ganhou mais? O gasto sobe junto: “inflação do estilo de vida”.' },
    { tipo: 'fala', dur: 2600, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Status comprado com dívida vira surto.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Pergunte: eu quero isso, ou quero que me vejam com isso?' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'neutro', g: G.APONTA, leg: 'Gaste no que VOCÊ valoriza — corte o resto sem dó.' },
    { tipo: 'fala', dur: 3200, cena: 'rua', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Liberdade é não precisar impressionar ninguém.' },
  ],
});
