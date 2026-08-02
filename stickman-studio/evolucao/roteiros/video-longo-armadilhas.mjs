// VÍDEO LONGO (long-form) para acumular horas de exibição — monetização.
// "12 Armadilhas Invisíveis do seu Dinheiro" — cada tópico com hook +
// psicologia + exemplo + saída. Gera capítulos (timestamps no console).
//
// Uso:  node roteiros/video-longo-armadilhas.mjs           (vídeo completo)
//       PREVIEW=1 node roteiros/video-longo-armadilhas.mjs  (só 3 tópicos)
//       ESCALA=2 node roteiros/video-longo-armadilhas.mjs   (estica p/ narração)
import { gerar, G } from './_runner.mjs';

// Cada tópico: título, cenário, prop (opcional) e as 4 falas.
const TOPICOS = [
  { t: 'A dor de pagar', cena: 'mercado', prop: 'nota',
    hook: 'Pagar dói — e o cartão foi feito pra você não sentir.',
    psico: 'a ínsula, no cérebro, acende como se fosse dor física.',
    exemplo: 'no crédito a dor vem depois, então você gasta mais.',
    dica: 'pra sentir o gasto, prefira débito ou dinheiro.' },
  { t: 'O viés do presente', cena: 'shopping',
    hook: 'Seu cérebro adora o agora e ignora o amanhã.',
    psico: 'o prazer imediato vale mais que a recompensa futura.',
    exemplo: 'por isso é fácil gastar hoje e adiar o poupar.',
    dica: 'automatize a poupança no dia do salário.' },
  { t: 'Compra por impulso', cena: 'shopping', prop: 'cartao',
    hook: '“Só dessa vez” é a frase mais cara do português.',
    psico: 'é o sistema rápido e emocional decidindo por você.',
    exemplo: 'cada clique parece pequeno; juntos, estouram o mês.',
    dica: 'regra das 24h: adie a compra por um dia.' },
  { t: 'Assinaturas fantasma', cena: 'casa', prop: 'celular',
    hook: 'Você paga por apps que nem lembra que assinou.',
    psico: 'viés do status quo: manter é mais fácil que cancelar.',
    exemplo: 'somem R$300 por mês sem alarme nenhum.',
    dica: 'liste tudo e cancele as “zumbis” hoje.' },
  { t: 'Gasto formiga', cena: 'cafe', prop: 'nota',
    hook: 'Pequeno, invisível… e devora o seu salário.',
    psico: 'contabilidade mental: ignoramos o que é “baratinho”.',
    exemplo: 'cafezinho, taxa, aquele extra — no ano vira um rombo.',
    dica: 'anote 7 dias e o vazamento aparece.' },
  { t: 'Ancoragem e promoções', cena: 'shopping', prop: 'cartao',
    hook: '“De R$200 por R$99” mexe com a sua cabeça.',
    psico: 'ancoragem: o preço cheio faz o desconto parecer pechincha.',
    exemplo: 'e o frete grátis te faz gastar mais pra “economizar”.',
    dica: 'faça a lista antes; compre só o que já queria.' },
  { t: 'A comparação social', cena: 'rua',
    hook: 'O carro novo do vizinho tirou o seu sono?',
    psico: 'comparação social: gastamos pra “empatar” com os outros.',
    exemplo: 'mas a vitrine dele esconde a fatura dele.',
    dica: 'corra a sua corrida; a meta dos outros não é a sua.' },
  { t: 'Aversão à perda', cena: 'banco',
    hook: 'Perder R$100 dói o dobro de ganhar R$100.',
    psico: 'aversão à perda: o medo pesa mais que o ganho.',
    exemplo: 'por isso a gente vende na baixa e não investe.',
    dica: 'pense no longo prazo e automatize os aportes.' },
  { t: 'O efeito avestruz', cena: 'quarto',
    hook: 'Chegou o boleto e o cérebro “finge que não viu”.',
    psico: 'efeito avestruz: evitar o problema pra não sofrer.',
    exemplo: 'mas ignorar só faz o juro crescer.',
    dica: 'encare, liste tudo e pague primeiro o que tira o sono.' },
  { t: 'Inflação do estilo de vida', cena: 'casa',
    hook: 'Ganhou mais? O gasto sobe junto, sem você ver.',
    psico: 'normalizamos o luxo de ontem como básico de hoje.',
    exemplo: 'aí o aumento some e a conta continua no limite.',
    dica: 'ao subir a renda, suba primeiro o quanto você guarda.' },
  { t: 'A conta mental do bônus', cena: 'shopping', prop: 'nota',
    hook: 'Dinheiro “extra” some fácil: 13º, bônus, restituição.',
    psico: 'tratamos “bônus” diferente de “salário” na cabeça.',
    exemplo: 'gasta tudo em dezembro e janeiro cobra a conta.',
    dica: 'divida o extra: dívidas, reserva e um “respiro”.' },
  { t: 'O seu eu do futuro', cena: 'praia',
    hook: 'Seu “eu de 70 anos” parece um estranho pro cérebro.',
    psico: 'por isso é tão difícil poupar pra aposentadoria.',
    exemplo: 'adiamos o futuro porque ele parece de “outra pessoa”.',
    dica: 'comece cedo e pequeno; os juros compostos fazem o resto.' },
];

const preview = !!process.env.PREVIEW;
const lista = preview ? TOPICOS.slice(0, 3) : TOPICOS;

const cenas = [];
cenas.push({ tipo: 'andar', dur: 4000, cena: 'escritorio', titulo: '12 Armadilhas\ndo seu Dinheiro', leg: 'A psicologia de por que você gasta mais do que devia.' });
cenas.push({ tipo: 'fala', dur: 4500, cena: 'escritorio', expr: 'neutro', g: G.APONTA, leg: 'Fica até o fim: cada armadilha tem uma saída simples. Anota as que são a sua cara.' });

lista.forEach((tp, i) => {
  const n = i + 1;
  cenas.push({ tipo: 'fala', dur: 5000, cena: tp.cena, expr: 'surpreso', prop: tp.prop, g: tp.prop ? G.MOSTRA : G.APONTA, titulo: `#${n} ${tp.t}`, leg: tp.hook });
  cenas.push({ tipo: 'fala', dur: 6500, cena: tp.cena, expr: 'preocupado', g: G.REFLETE, leg: `Psicologia: ${tp.psico}` });
  if (n % 3 === 0) cenas.push({ tipo: 'fala', dur: 5000, cena: 'dramatico', expr: 'surto', g: G.ALTO, leg: `${tp.exemplo} SURTO!` });
  else cenas.push({ tipo: 'fala', dur: 5000, cena: tp.cena, expr: 'tonto', g: G.APONTA, leg: tp.exemplo });
  cenas.push({ tipo: 'fala', dur: 5500, cena: tp.cena, expr: 'feliz', g: G.APONTA, leg: `Saída: ${tp.dica}` });
});

cenas.push({ tipo: 'fala', dur: 5000, cena: 'escritorio', expr: 'neutro', g: G.APONTA, titulo: 'Recapitulando', leg: 'São 12 armadilhas e 12 saídas. Qual mais pegou você? Comenta aí.' });
cenas.push({ tipo: 'fala', dur: 5500, cena: 'praia', expr: 'feliz', g: G.ABRE, titulo: 'Surto Financeiro', leg: 'Consciência é o melhor investimento. Se inscreve pra não surtar sozinho.' });

// Capítulos (YouTube) — imprime os timestamps para colar na descrição.
const fator = Number(process.env.ESCALA) || 1;
let acc = 0; const mmss = (ms) => { const s = Math.round(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
console.log('\n== CAPÍTULOS (cole na descrição do YouTube) ==');
console.log(`${mmss(0)} Introdução`);
cenas.forEach(c => { if (c.titulo && c.titulo.startsWith('#')) console.log(`${mmss(acc)} ${c.titulo.replace('\n', ' ')}`); acc += c.dur * fator; });
console.log('');

await gerar({ nome: 'video-longo-armadilhas' + (preview ? '-preview' : ''), cenas });
