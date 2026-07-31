// VÍDEO LONGO (long-form) — "As 7 Mentiras que o seu Cérebro conta sobre Dinheiro".
// Gancho viral: são ÓBVIAS, estão bem na sua frente, e você não vê. Retenção com
// "fica até o final — a 7ª é a mais perigosa". Cada mentira = um viés cognitivo.
//
// Uso:  node roteiros/video-longo-7-mentiras.mjs            (vídeo completo)
//       PREVIEW=1 node roteiros/video-longo-7-mentiras.mjs  (só 3 mentiras)
//       ESCALA=2 node roteiros/video-longo-7-mentiras.mjs   (estica p/ narração)
import { gerar, G } from './_runner.mjs';

// Cada mentira: a frase que o cérebro repete, o viés por trás, um exemplo e a verdade.
const MENTIRAS = [
  { t: '"Eu mereço isso"', cena: 'shopping', prop: 'cartao',
    vies: 'viés do presente — o prazer de AGORA vale mais que o amanhã.',
    exemplo: 'o "mereço" de hoje vira o "como assim?" da fatura.',
    verdade: 'espere 24h: o desejo que some não era necessidade.' },
  { t: '"É só uns trocados"', cena: 'cafe', prop: 'nota',
    vies: 'contabilidade mental — a gente despreza o que é "pequeno".',
    exemplo: 'cafezinho, taxa, aquele extra: no ano, viram um rombo.',
    verdade: 'some os "trocados" por 7 dias e assuste com o total.' },
  { t: '"Depois eu organizo"', cena: 'casa', prop: 'documento',
    vies: 'viés do status quo — manter é mais fácil do que agir.',
    exemplo: 'o "depois" nunca chega — e a bagunça vira juros.',
    verdade: 'faça o mínimo HOJE: liste tudo em 10 minutos.' },
  { t: '"Tá em promoção, é economia"', cena: 'shopping', prop: 'cartao',
    vies: 'ancoragem — o preço cheio faz o desconto parecer pechincha.',
    exemplo: 'você gasta R$100 pra "economizar" R$20 que nem ia gastar.',
    verdade: 'faça a lista antes; desconto no que você não queria é gasto.' },
  { t: '"Todo mundo tem"', cena: 'rua',
    vies: 'prova social — a gente copia pra "pertencer".',
    exemplo: 'a vitrine dos outros esconde a fatura dos outros.',
    verdade: 'pergunte: eu quero isso, ou quero que me vejam com isso?' },
  { t: '"Se eu vender agora, eu perco"', cena: 'banco',
    vies: 'aversão à perda — perder dói o dobro de ganhar.',
    exemplo: 'por medo, a gente segura o erro e vende o acerto.',
    verdade: 'decida pelo plano, não pela emoção. Automatize os aportes.' },
  { t: '"Comigo vai dar certo"', cena: 'escritorio',
    vies: 'excesso de confiança — todo mundo se acha a exceção.',
    exemplo: 'sem reserva, o imprevisto (que sempre vem) vira dívida.',
    verdade: 'monte a reserva ANTES de apostar que vai dar certo.' },
];

const preview = !!process.env.PREVIEW;
const lista = preview ? MENTIRAS.slice(0, 3) : MENTIRAS;

const cenas = [];
// --- ABERTURA (gancho viral: óbvio, na sua frente, você não vê) ---
cenas.push({ tipo: 'andar', dur: 4000, cena: 'escritorio', titulo: 'As 7 Mentiras\ndo seu Cérebro', leg: 'Sobre dinheiro. E o pior: são ÓBVIAS.' });
cenas.push({ tipo: 'fala', dur: 5000, cena: 'escritorio', expr: 'surpreso', g: G.APONTA, leg: 'Elas estão bem na sua frente, todo dia — e você não vê.' });
cenas.push({ tipo: 'fala', dur: 5000, cena: 'escritorio', expr: 'neutro', g: G.REFLETE, leg: 'Seu cérebro repete essas frases pra te fazer gastar. Fica até o final: a 7ª é a mais perigosa.' });

lista.forEach((m, i) => {
  const n = i + 1;
  cenas.push({ tipo: 'fala', dur: 5000, cena: m.cena, expr: 'surpreso', prop: m.prop, g: m.prop ? G.MOSTRA : G.APONTA, titulo: `Mentira #${n}`, leg: `O cérebro diz: ${m.t}` });
  cenas.push({ tipo: 'fala', dur: 6500, cena: m.cena, expr: 'preocupado', g: G.REFLETE, leg: `A verdade escondida: ${m.vies}` });
  if (n % 3 === 0) cenas.push({ tipo: 'fala', dur: 5000, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: `${m.exemplo} SURTO!` });
  else cenas.push({ tipo: 'fala', dur: 5000, cena: m.cena, expr: 'tonto', g: G.APONTA, leg: m.exemplo });
  cenas.push({ tipo: 'fala', dur: 5500, cena: m.cena, expr: 'feliz', g: G.APONTA, leg: `Antídoto: ${m.verdade}` });
  // Ganchos de retenção no meio do vídeo.
  if (!preview && n === 3) cenas.push({ tipo: 'fala', dur: 4000, cena: 'escritorio', expr: 'neutro', g: G.APONTA, leg: 'Se você já se pegou nessas 3… a #5 vai doer. Continua.' });
  if (!preview && n === 6) cenas.push({ tipo: 'fala', dur: 4000, cena: 'escritorio', expr: 'preocupado', g: G.REFLETE, leg: 'Agora a mais perigosa de todas — a que parece a mais inofensiva.' });
});

// --- RECAP + OUTRO ---
cenas.push({ tipo: 'fala', dur: 5500, cena: 'escritorio', expr: 'neutro', g: G.APONTA, titulo: 'Recapitulando', leg: 'São 7 mentiras e 7 antídotos. Percebeu como estavam na sua cara o tempo todo?' });
cenas.push({ tipo: 'fala', dur: 5500, cena: 'praia', expr: 'feliz', g: G.ABRE, titulo: 'Surto Financeiro', leg: 'Enxergar a mentira já é meia liberdade. Comenta qual te pegou e se inscreve pra não surtar sozinho.' });

// Capítulos (YouTube) — imprime os timestamps para colar na descrição.
const fator = Number(process.env.ESCALA) || 1;
let acc = 0; const mmss = (ms) => { const s = Math.round(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
console.log('\n== CAPÍTULOS (cole na descrição do YouTube) ==');
console.log(`${mmss(0)} Introdução`);
cenas.forEach(c => { if (c.titulo && c.titulo.startsWith('Mentira')) console.log(`${mmss(acc)} ${c.titulo.replace('\n', ' ')}`); acc += c.dur * fator; });
console.log('');

await gerar({ nome: 'video-longo-7-mentiras' + (preview ? '-preview' : ''), cenas });
