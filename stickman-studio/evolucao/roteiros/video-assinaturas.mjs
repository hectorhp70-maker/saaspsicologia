// Humor — "As assinaturas fantasma" (inércia / status quo)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-assinaturas',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'casa', titulo: 'Assinaturas fantasma', leg: 'Elas somem do seu radar, não da sua fatura.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'tonto', g: G.APONTA, leg: 'Você paga 6 streamings pra assistir sempre o mesmo.' },
    { tipo: 'fala', dur: 2800, cena: 'cafe', expr: 'preocupado', g: G.REFLETE, leg: 'Inércia: é mais fácil pagar do que cancelar.' },
    { tipo: 'fala', dur: 2800, cena: 'academia', expr: 'surpreso', g: G.APONTA, leg: 'A academia leva seu dinheiro; você não leva o corpo lá.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Somem R$300 por mês em fantasmas. SURTO silencioso.' },
    { tipo: 'andar', dur: 2600, cena: 'mercado', leg: 'Liste as assinaturas e cancele as “zumbis”.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Pague só pelo que você realmente usa.' },
  ],
});
