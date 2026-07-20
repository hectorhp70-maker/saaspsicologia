// director.js
// "Diretor de IA": transforma texto em um roteiro (script) de cenas para o
// stickman. Dois modos:
//   1) roteiroLocal(prompt)  -> agente por regras (100% local, sem API)
//   2) callLLM(config,prompt) -> conector p/ um LLM tipo Hermes (endpoint
//      compatível com OpenAI: OpenRouter/Together/Ollama). Retorna o mesmo
//      formato de roteiro.
//
// Formato do roteiro:
// {
//   titulo: "SURTO FINANCEIRO",
//   cenas: [
//     { pose, expression, fundo, surto, frames, angles?, narracao? }, ...
//   ]
// }
// `pose` é um id de pose (idle, wave, ...) OU vem com `angles` explícito.

import { defaultPoses } from './poses.js';
import { EXPRESSIONS } from './skeleton.js';
import { BACKGROUNDS } from './effects.js';

const POSE_ANGLES = Object.fromEntries(defaultPoses.map((p) => [p.id, p.angles]));

// Poses extras usadas pelo roteiro (não estão na biblioteca base).
const EXTRA = {
  alert: { spineLean: -6, shoulderL: -45, elbowL: -25, shoulderR: 45, elbowR: 25, hipL: -10, kneeL: 6, hipR: 10, kneeR: 6 },
  melt: { spineLean: 0, shoulderL: -150, elbowL: -25, shoulderR: 150, elbowR: 25, hipL: -14, kneeL: 14, hipR: 14, kneeR: 14 },
};

export const POSE_IDS = defaultPoses.map((p) => p.id);
export const EXPRESSION_IDS = EXPRESSIONS.map((e) => e.id);
export const BACKGROUND_IDS = BACKGROUNDS.map((b) => b.id);

const norm = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function has(t, re) { return re.test(t); }

function matchExpression(t) {
  if (has(t, /furioso|surto|surtan|pistola|raiva|explod|puto|nervos/)) return 'furioso';
  if (has(t, /surpres|susto|assust|chocad|pasm/)) return 'surpreso';
  if (has(t, /triste|deprim|chate|choran/)) return 'triste';
  if (has(t, /bravo|irritad|zangad/)) return 'bravo';
  if (has(t, /preocup|ansios|tens|apreensiv|medo/)) return 'preocupado';
  if (has(t, /tonto|zonzo|confus|perdid/)) return 'tonto';
  if (has(t, /feliz|alegr|content|comemor|sorri|anima/)) return 'feliz';
  return null;
}

function matchPose(t) {
  if (has(t, /acen|tchau|\bola\b|\boi\b/)) return 'wave';
  if (has(t, /corr|fug|dispar/)) return 'run';
  if (has(t, /caminh|and(a|o|ar)/)) return 'walk';
  if (has(t, /pul(a|o|ar)|salt|comemor/)) return 'jump';
  if (has(t, /apont|most/)) return 'point';
  if (has(t, /ombro|sei la|duvid|nao sei/)) return 'shrug';
  if (has(t, /sent|cadeir/)) return 'sit';
  if (has(t, /pens|reflet|medit/)) return 'think';
  return null;
}

function matchBg(t) {
  if (has(t, /explos|raios|caos|impacto/)) return 'explosao';
  if (has(t, /escur|dramat|sombri|tens|noite/)) return 'dramatico';
  if (has(t, /transparent/)) return 'transparent';
  if (has(t, /branc|limp|claro/)) return 'white';
  return null;
}

function matchSurtoNumber(t) {
  const m = t.match(/surto\s*(\d{1,2})|intensidade\s*(\d{1,2})/);
  if (m) return Math.min(10, Number(m[1] || m[2]));
  return null;
}

function makeTitle(raw) {
  const clean = String(raw || '').trim().replace(/\s+/g, ' ');
  if (!clean) return 'SURTO FINANCEIRO';
  return clean.slice(0, 30).toUpperCase();
}

function resolveAngles(pose) {
  return POSE_ANGLES[pose] || EXTRA[pose] || POSE_ANGLES.idle;
}

function scene(pose, expression, fundo, surto, frames, narracao) {
  return { pose, expression, fundo, surto, frames, angles: resolveAngles(pose), narracao };
}

// Agente local por regras. Sempre retorna um roteiro válido.
export function roteiroLocal(prompt) {
  const t = norm(prompt);
  const expr = matchExpression(t);
  const pose = matchPose(t);
  const bg = matchBg(t);
  const money = has(t, /dinheiro|grana|money|\$|financ|divid|conta|boleto|imposto|fatura|cartao|juros|salario|pix/);
  let surto = matchSurtoNumber(t);
  const isSurto = has(t, /surto|surtan|caos|panic|desesper|explod|crise|pistola|nervos|estress/) || expr === 'furioso';

  const titulo = makeTitle(prompt);

  if (isSurto || money) {
    if (surto == null) surto = isSurto ? 9 : 6;
    return {
      titulo,
      cenas: [
        scene('idle', 'neutro', bg || 'dramatico', 0, 12, 'Tudo sob controle... teoricamente.'),
        scene('alert', 'surpreso', bg || 'dramatico', Math.min(3, surto), 10, 'Aí chega a conta.'),
        scene('melt', expr && expr !== 'neutro' ? expr : 'furioso', 'explosao', surto, 14, 'E vem o SURTO FINANCEIRO!'),
        scene('shrug', 'preocupado', bg || 'dramatico', Math.max(1, surto - 6), 16, '...respira. Vai dar certo.'),
      ],
    };
  }

  // Ação simples (ex.: "acena feliz", "corre assustado").
  const p = pose || 'idle';
  const e = expr || 'neutro';
  if (surto == null) surto = 0;
  return {
    titulo,
    cenas: [
      scene('idle', 'neutro', bg || 'white', 0, 10, ''),
      scene(p, e, bg || 'white', surto, 12, ''),
      scene('idle', 'neutro', bg || 'white', 0, 10, ''),
    ],
  };
}

// Converte um roteiro em quadros-chave da timeline.
// resolvePose(id) -> angles (para roteiros vindos do LLM que usam só ids).
export function scriptToTimeline(script, resolvePose) {
  return (script.cenas || []).map((c) => ({
    angles: c.angles || (resolvePose ? resolvePose(c.pose) : null) || resolveAngles(c.pose || 'idle'),
    expression: EXPRESSION_IDS.includes(c.expression) ? c.expression : 'neutro',
    frames: Math.max(2, Number(c.frames) || 12),
    bg: BACKGROUND_IDS.includes(c.fundo) ? c.fundo : null,
    surto: c.surto == null ? null : Math.max(0, Math.min(10, Number(c.surto))),
    caption: c.narracao || c.legenda || null,
  }));
}

// --- Conector LLM (tipo Hermes) ---------------------------------------------
function systemPrompt() {
  return [
    'Você é um diretor de animação de um personagem stickman para o canal "Surto Financeiro" (finanças + psicologia).',
    'Responda SOMENTE com um JSON válido, sem texto extra, no formato:',
    '{"titulo": string, "cenas": [{"pose": string, "expression": string, "fundo": string, "surto": number, "frames": number, "narracao": string}]}',
    `poses válidas: ${POSE_IDS.join(', ')}.`,
    `expressions válidas: ${EXPRESSION_IDS.join(', ')}.`,
    `fundos válidos: ${BACKGROUND_IDS.join(', ')}.`,
    'surto é a intensidade do efeito (dinheiro/caos voando): número de 0 a 10.',
    'frames é a duração da cena em quadros (8 a 24).',
    'Crie de 3 a 6 cenas com um arco (começo, clímax do surto, desfecho). titulo em CAIXA ALTA e curto.',
  ].join('\n');
}

// Extrai o primeiro objeto JSON de um texto (tolerante a ```json ... ```).
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('A IA não retornou JSON.');
  return JSON.parse(body.slice(start, end + 1));
}

// config: { endpoint, model, apiKey }. Endpoint compatível com OpenAI
// (/v1/chat/completions). Ex.: OpenRouter com um modelo Hermes, ou Ollama local.
export async function callLLM(config, prompt) {
  if (!config?.endpoint || !config?.model) {
    throw new Error('Configure o endpoint e o modelo da IA primeiro.');
  }
  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;

  const res = await fetch(config.endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      temperature: 0.8,
      messages: [
        { role: 'system', content: systemPrompt() },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Erro da IA (${res.status}): ${await res.text().catch(() => '')}`.slice(0, 200));
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Resposta da IA vazia.');
  const script = extractJSON(content);
  script.titulo = makeTitle(script.titulo || prompt);
  return script;
}
