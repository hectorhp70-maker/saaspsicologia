// Humor — "Segunda eu começo a economizar" (present bias / procrastinação)
import { gerar, G } from './_runner.mjs';
await gerar({
  nome: 'video-segunda-comeco',
  cenas: [
    { tipo: 'andar', dur: 3000, cena: 'academia', titulo: 'Segunda eu começo', leg: 'O feriado favorito do brasileiro: a próxima segunda.' },
    { tipo: 'fala', dur: 3000, cena: 'academia', expr: 'tonto', g: G.APONTA, leg: '“Segunda eu começo a economizar.” (de novo)' },
    { tipo: 'fala', dur: 2800, cena: 'casa', expr: 'surpreso', g: G.REFLETE, leg: 'Present bias: o prazer é hoje, a disciplina é “amanhã”.' },
    { tipo: 'fala', dur: 2800, cena: 'mercado', expr: 'preocupado', g: G.APONTA, leg: 'Amanhã nunca chega no calendário do impulso.' },
    { tipo: 'fala', dur: 2800, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: 'Doze “próximas segundas” depois… SURTO.' },
    { tipo: 'andar', dur: 2600, cena: 'rua', leg: 'Comece HOJE, pequeno: R$5 já é começar.' },
    { tipo: 'fala', dur: 3200, cena: 'casa', expr: 'feliz', titulo: 'Surto Financeiro', g: G.ABRE, leg: 'A melhor segunda para começar é agora.' },
  ],
});
