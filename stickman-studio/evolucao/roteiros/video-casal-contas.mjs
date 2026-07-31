// Tema — "Casal: juntar ou separar as contas?" (orçamento conjunto, transparência)
// Cenários: casa / cafe / quarto (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-casal-contas',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'cafe', titulo: 'Juntar ou separar as contas?', leg: 'Dinheiro é a maior fonte de briga nos casais.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'neutro', g: G.APONTA, leg: 'Não existe conta “certa”: existe conta COMBINADA.' },
    { tipo: 'fala', dur: 3000, cena: 'cafe', expr: 'neutro', g: G.REFLETE, leg: 'Modelo justo: cada um contribui proporcional à renda.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Segredo financeiro corrói a confiança — e vira surto.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Tenham metas do casal E autonomia individual.' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'feliz', g: G.APONTA, leg: 'Reunião mensal de 20 min: alinhem as contas sem drama.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Time que fala de dinheiro joga junto.' },
  ],
});
