// Tema — "Festas de fim de ano: e a conta de janeiro?" (gasto sazonal, pressão social)
// Cenários: shopping / casa / mercado / rua (+ dramático)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-festas-fim-ano',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'shopping', titulo: 'A conta de janeiro', leg: 'Por que o fim de ano estoura o orçamento?' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'surpreso', prop: 'sacola', g: G.MOSTRA, leg: 'No clima de festa, o bolso entra em “modo generoso”.' },
    { tipo: 'fala', dur: 3000, cena: 'casa', expr: 'neutro', g: G.REFLETE, leg: 'Presente caro não é mais amor — a gente superestima o preço.' },
    { tipo: 'fala', dur: 2800, cena: 'mercado', expr: 'tonto', prop: 'cartao', g: G.MOSTRA, leg: 'Ceia + presentes + promoções = fatura turbinada.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Aí janeiro cobra: IPTU, IPVA, matrícula… e a festa. SURTO!' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Liste os presentes e ponha um teto por pessoa.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Natal bom é o que não estraga o seu janeiro.' },
  ],
});
