// Humor — "O 13º já nasce com dono" (mental accounting / windfall)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-decimo-terceiro',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'shopping', titulo: 'O 13º já tem dono', leg: 'Mal caiu na conta e já sumiu no planejamento mental.' },
    { tipo: 'fala', dur: 3000, cena: 'shopping', expr: 'surpreso', prop: 'nota', g: G.MOSTRA, leg: 'O 13º já “tem dono”: presente, viagem, aquele desejo antigo.' },
    { tipo: 'fala', dur: 2800, cena: 'shopping', expr: 'tonto', g: G.APONTA, leg: 'Mental accounting: dinheiro “extra” a gente gasta fácil.' },
    { tipo: 'fala', dur: 2800, cena: 'banco', expr: 'neutro', g: G.REFLETE, leg: 'Bônus não é sobra — é chance de virar o jogo.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'furioso', g: G.ALTO, leg: 'Gastou tudo em dezembro; janeiro cobra a conta. SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'praia', leg: 'Divida o 13º: dívidas, reserva e um “respiro”.' },
    { tipo: 'fala', dur: 3200, cena: 'praia', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'Bônus bem usado compra paz, não só festa.' },
  ],
});
