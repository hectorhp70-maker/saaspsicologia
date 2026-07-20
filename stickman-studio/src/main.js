// main.js — orquestra o editor, os personagens, a biblioteca de poses,
// a timeline de quadros-chave e a exportação.

import { ANGLE_KEYS, ANGLE_META, EXPRESSIONS, HAIR_STYLES, OUTFITS, normalizePose, poseToSVG } from './skeleton.js';
import { BACKGROUNDS, PROPS } from './effects.js';
import { defaultCharacters, CHARACTER_FIELDS, normalizeCharacter } from './characters.js';
import { defaultPoses } from './poses.js';
import { defaultAnimations, cloneKeyframes } from './animations.js';
import { interpolatePoses } from './interpolate.js';
import { roteiroLocal, scriptToTimeline, callLLM } from './director.js';
import {
  loadCustomPoses, upsertCustomPose, removeCustomPose, exportCustomPosesFile, importCustomPosesFile,
  loadCustomCharacters, upsertCustomCharacter, removeCustomCharacter, exportCustomCharactersFile, importCustomCharactersFile,
  loadCustomAnimations, upsertCustomAnimation, removeCustomAnimation, exportCustomAnimationsFile, importCustomAnimationsFile,
  loadAIConfig, saveAIConfig,
  exportProjectFile, importProjectFile,
} from './storage.js';
import { exportSVG, exportThumbnail, exportPNGSequence, exportWebM, exportSRT } from './export.js';

// ---------- Estado ----------
const state = {
  character: normalizeCharacter(defaultCharacters[0]),
  activeCharacterId: defaultCharacters[0].id,
  pose: normalizePose(defaultPoses[0].angles),
  expression: defaultPoses[0].expression || 'neutro',
  activePoseId: 'idle',
  timeline: [], // [{ angles, expression, frames }]
  surto: 0, // intensidade do efeito Surto Financeiro (0..10)
  phase: 0, // fase p/ animar os efeitos
  titulo: '', // título exibido na tela (vazio = sem título)
  playing: false,
};

const el = (id) => document.getElementById(id);
const stage = el('stage');
const statusEl = el('status');
const exprLabel = (id) => (EXPRESSIONS.find((e) => e.id === id) || {}).label || id;
function setStatus(msg) { statusEl.textContent = msg; }

function renderOptions() {
  return {
    background: el('bgSelect').value,
    color: el('colorInput').value,
    expression: state.expression,
    surto: state.surto,
    phase: state.phase,
    title: state.titulo,
    width: 400,
    height: 500,
  };
}

function renderPreview() {
  stage.innerHTML = poseToSVG(state.pose, state.character, renderOptions());
}

function slugify(s) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}

// ---------- Sliders + expressão ----------
function buildSliders() {
  const container = el('sliders');
  container.innerHTML = '';
  for (const key of ANGLE_KEYS) {
    const meta = ANGLE_META[key];
    const row = document.createElement('div');
    row.className = 'slider-row';
    row.innerHTML = `
      <label for="sl_${key}">${meta.label}</label>
      <input type="range" id="sl_${key}" min="${meta.min}" max="${meta.max}" step="1" value="${state.pose[key]}" />
      <span class="val" id="val_${key}">${Math.round(state.pose[key])}°</span>`;
    container.appendChild(row);
    const input = row.querySelector('input');
    input.addEventListener('input', () => {
      state.pose[key] = Number(input.value);
      el(`val_${key}`).textContent = `${Math.round(state.pose[key])}°`;
      renderPreview();
    });
  }
}

function syncSliders() {
  for (const key of ANGLE_KEYS) {
    const input = el(`sl_${key}`);
    if (input) {
      input.value = state.pose[key];
      el(`val_${key}`).textContent = `${Math.round(state.pose[key])}°`;
    }
  }
}

function buildExpressionSelect() {
  const sel = el('expressionSelect');
  sel.innerHTML = EXPRESSIONS.map((e) => `<option value="${e.id}">${e.label}</option>`).join('');
  sel.value = state.expression;
}

function buildBgSelect() {
  const sel = el('bgSelect');
  sel.innerHTML = BACKGROUNDS.map((b) => `<option value="${b.id}">${b.label}</option>`).join('');
  sel.value = 'white';
}

// Anima os efeitos (partículas do surto) mesmo com a timeline parada.
function startEffectTicker() {
  setInterval(() => {
    if (state.playing || state.surto <= 0) return;
    state.phase = (state.phase + 0.012) % 1;
    renderPreview();
  }, 45);
}

// ---------- Personagens ----------
function allCharacters() {
  const custom = loadCustomCharacters().map((c) => ({ ...c, custom: true }));
  return [...defaultCharacters.map((c) => ({ ...c, custom: false })), ...custom];
}

function isActiveCharCustom() {
  return loadCustomCharacters().some((c) => c.id === state.activeCharacterId);
}

function buildPropSelect() {
  const sel = el('propSelect');
  sel.innerHTML = PROPS.map((p) => `<option value="${p.id}">${p.label}</option>`).join('');
  sel.value = state.character.prop || 'none';
}

function buildWardrobeSelects() {
  el('hairStyle').innerHTML = HAIR_STYLES.map((h) => `<option value="${h.id}">${h.label}</option>`).join('');
  el('outfitSelect').innerHTML = OUTFITS.map((o) => `<option value="${o.id}">${o.label}</option>`).join('');
  el('hairStyle').value = state.character.hairStyle || 'curto';
  el('outfitSelect').value = state.character.outfit || (state.character.jacket ? 'paleto' : 'nenhum');
}

function buildCharFields() {
  const container = el('charFields');
  container.innerHTML = '';
  for (const f of CHARACTER_FIELDS) {
    const div = document.createElement('div');
    div.className = 'char-field';
    div.innerHTML = `
      <label for="ch_${f.key}">${f.label}</label>
      <input type="number" id="ch_${f.key}" min="${f.min}" max="${f.max}" step="${f.step}" value="${state.character[f.key]}" />`;
    container.appendChild(div);
    const input = div.querySelector('input');
    input.addEventListener('input', () => {
      const v = Number(input.value);
      if (!Number.isFinite(v)) return;
      state.character[f.key] = v;
      renderPreview();
    });
  }
}

function syncCharFields() {
  for (const f of CHARACTER_FIELDS) {
    const input = el(`ch_${f.key}`);
    if (input) input.value = state.character[f.key];
  }
  el('colorInput').value = state.character.color || '#111111';
  el('showFace').checked = state.character.showFace !== false;
  el('tieToggle').checked = !!state.character.tie;
  el('tieColor').value = state.character.tieColor || '#c0392b';
  el('hairToggle').checked = !!state.character.hair;
  el('hairColor').value = state.character.hairColor || '#20140a';
  el('hairStyle').value = state.character.hairStyle || 'curto';
  el('outfitSelect').value = state.character.outfit || (state.character.jacket ? 'paleto' : 'nenhum');
  el('outfitColor').value = state.character.outfitColor || state.character.jacketColor || '#2c3e50';
  el('propSelect').value = state.character.prop || 'none';
  el('viewSelect').value = state.character.view || 'frente';
  el('facingSelect').value = state.character.facing || 'dir';
}

function refreshCharSelect() {
  const sel = el('charSelect');
  sel.innerHTML = allCharacters()
    .map((c) => `<option value="${c.id}">${c.nome || c.id}${c.custom ? ' (custom)' : ''}</option>`)
    .join('');
  sel.value = state.activeCharacterId;
  el('delChar').disabled = !isActiveCharCustom();
}

function applyCharacter(id) {
  const char = allCharacters().find((c) => c.id === id);
  if (!char) return;
  state.character = normalizeCharacter(char);
  state.activeCharacterId = id;
  syncCharFields();
  refreshCharSelect();
  renderPreview();
}

function saveCurrentCharacter() {
  const nome = el('charName').value.trim();
  if (!nome) { setStatus('Dê um nome para o personagem antes de salvar.'); return; }
  const id = slugify(nome) + '-' + Date.now().toString(36).slice(-4);
  const char = normalizeCharacter({ ...state.character, id, nome });
  upsertCustomCharacter(char);
  el('charName').value = '';
  state.activeCharacterId = id;
  refreshCharSelect();
  el('charSelect').value = id;
  setStatus(`Personagem "${nome}" salvo localmente.`);
}

// ---------- Biblioteca de poses ----------
function allPoses() {
  const custom = loadCustomPoses().map((p) => ({ ...p, custom: true }));
  return [...defaultPoses.map((p) => ({ ...p, custom: false })), ...custom];
}

function applyPose(pose, id) {
  state.pose = normalizePose(pose.angles);
  state.expression = pose.expression || 'neutro';
  state.activePoseId = id;
  syncSliders();
  el('expressionSelect').value = state.expression;
  renderPreview();
  renderPoseList();
}

function renderPoseList() {
  const list = el('poseList');
  list.innerHTML = '';
  for (const p of allPoses()) {
    const li = document.createElement('li');
    const active = p.id === state.activePoseId ? ' active' : '';
    li.innerHTML = `
      <button class="pose-btn${active}" data-id="${p.id}">${p.nome || p.id}</button>
      ${p.custom ? '<span class="tag">custom</span><button class="del" data-del="' + p.id + '" title="Excluir">✕</button>' : '<span class="tag">base</span>'}`;
    list.appendChild(li);
  }
  list.querySelectorAll('.pose-btn').forEach((b) =>
    b.addEventListener('click', () => {
      const pose = allPoses().find((x) => x.id === b.dataset.id);
      if (pose) applyPose(pose, pose.id);
    })
  );
  list.querySelectorAll('.del').forEach((b) =>
    b.addEventListener('click', () => {
      removeCustomPose(b.dataset.del);
      renderPoseList();
    })
  );
}

function saveCurrentPose() {
  const nome = el('poseName').value.trim();
  if (!nome) { setStatus('Dê um nome para a pose antes de salvar.'); return; }
  const id = slugify(nome) + '-' + Date.now().toString(36).slice(-4);
  upsertCustomPose({ id, nome, expression: state.expression, angles: { ...state.pose } });
  el('poseName').value = '';
  state.activePoseId = id;
  renderPoseList();
  setStatus(`Pose "${nome}" salva localmente.`);
}

// ---------- Animações prontas ----------
function allAnimations() {
  const custom = loadCustomAnimations().map((a) => ({ ...a, custom: true }));
  return [...defaultAnimations.map((a) => ({ ...a, custom: false })), ...custom];
}

function activeAnimId() {
  return el('animSelect').value;
}

function isActiveAnimCustom() {
  return loadCustomAnimations().some((a) => a.id === activeAnimId());
}

function refreshAnimSelect() {
  const sel = el('animSelect');
  const prev = sel.value;
  sel.innerHTML = allAnimations()
    .map((a) => `<option value="${a.id}">${a.nome || a.id}${a.custom ? ' (custom)' : ''}</option>`)
    .join('');
  if (allAnimations().some((a) => a.id === prev)) sel.value = prev;
  el('delAnim').disabled = !isActiveAnimCustom();
}

function loadAnimation() {
  const anim = allAnimations().find((a) => a.id === activeAnimId());
  if (!anim) return;
  state.timeline = cloneKeyframes(anim);
  renderTimeline();
  setStatus(`Animação "${anim.nome}" carregada na timeline.`);
}

function saveTimelineAsAnimation() {
  const nome = el('animName').value.trim();
  if (!nome) { setStatus('Dê um nome para a animação antes de salvar.'); return; }
  if (state.timeline.length < 2) { setStatus('Adicione ao menos 2 quadros-chave.'); return; }
  const id = slugify(nome) + '-' + Date.now().toString(36).slice(-4);
  upsertCustomAnimation({ id, nome, keyframes: cloneKeyframes({ keyframes: state.timeline }) });
  el('animName').value = '';
  refreshAnimSelect();
  el('animSelect').value = id;
  el('delAnim').disabled = false;
  setStatus(`Animação "${nome}" salva localmente.`);
}

// ---------- Timeline de quadros-chave ----------
function addKeyframe() {
  state.timeline.push({ angles: { ...state.pose }, expression: state.expression, frames: 16 });
  renderTimeline();
  setStatus(`Quadro-chave ${state.timeline.length} adicionado.`);
}

function renderTimeline() {
  const ol = el('timeline');
  ol.innerHTML = '';
  state.timeline.forEach((kf, i) => {
    const isLast = i === state.timeline.length - 1;
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="kf-idx">${i + 1}</span>
      <span class="kf-name"><b>${exprLabel(kf.expression)}</b> · incl. ${Math.round(kf.angles.spineLean)}°</span>
      <span class="kf-frames">${isLast ? '' : `<input type="number" min="2" max="240" value="${kf.frames}" data-frames="${i}" title="Quadros até o próximo" />`}</span>
      <span class="kf-actions">
        <button class="mini" data-apply="${i}" title="Carregar no editor">✎</button>
        <button class="mini del" data-del="${i}" title="Remover">✕</button>
      </span>`;
    ol.appendChild(li);
  });

  ol.querySelectorAll('input[data-frames]').forEach((inp) =>
    inp.addEventListener('input', () => {
      state.timeline[Number(inp.dataset.frames)].frames = Math.max(2, Number(inp.value) || 2);
    })
  );
  ol.querySelectorAll('[data-apply]').forEach((b) =>
    b.addEventListener('click', () => {
      const kf = state.timeline[Number(b.dataset.apply)];
      state.pose = normalizePose(kf.angles);
      state.expression = kf.expression;
      state.activePoseId = null;
      syncSliders();
      el('expressionSelect').value = state.expression;
      renderPreview();
      renderPoseList();
    })
  );
  ol.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', () => {
      state.timeline.splice(Number(b.dataset.del), 1);
      renderTimeline();
    })
  );
}

// Concatena a interpolação de cada trecho. Retorna
// [{ angles, expression, bg, surto }] — bg/surto podem ser null (usa a UI).
const lerp = (a, b, t) => a + (b - a) * t;
function timelineFrames() {
  const tl = state.timeline;
  if (tl.length === 0) return [{ angles: { ...state.pose }, expression: state.expression, bg: null, surto: null }];
  if (tl.length === 1) {
    const k = tl[0];
    return [{ angles: { ...k.angles }, expression: k.expression, bg: k.bg ?? null, surto: k.surto ?? null, caption: k.caption ?? null }];
  }
  const out = [];
  for (let i = 0; i < tl.length - 1; i++) {
    const from = tl[i];
    const to = tl[i + 1];
    const seg = interpolatePoses(normalizePose(from.angles), normalizePose(to.angles), from.frames);
    const hasSurto = from.surto != null || to.surto != null;
    let frames = seg.map((a, k) => {
      const t = seg.length > 1 ? k / (seg.length - 1) : 0;
      const surto = hasSurto ? lerp(from.surto ?? 0, to.surto ?? from.surto ?? 0, t) : null;
      return { angles: a, expression: from.expression, bg: from.bg ?? null, surto, caption: from.caption ?? null };
    });
    if (i > 0) frames = frames.slice(1); // evita duplicar o quadro de junção
    out.push(...frames);
  }
  return out;
}

// ---------- Diretor de IA ----------
function applyScript(script) {
  const resolve = (id) => allPoses().find((p) => p.id === id)?.angles || null;
  state.timeline = scriptToTimeline(script, resolve);
  if (script.titulo) {
    state.titulo = script.titulo;
    el('titleInput').value = script.titulo;
  }
  const first = state.timeline[0];
  if (first) {
    if (first.bg) el('bgSelect').value = first.bg;
    if (first.surto != null) {
      state.surto = first.surto;
      el('surtoRange').value = first.surto;
      el('surtoVal').textContent = String(Math.round(first.surto));
    }
    state.pose = normalizePose(first.angles);
    state.expression = first.expression;
    state.activePoseId = null;
    syncSliders();
    el('expressionSelect').value = state.expression;
  }
  renderTimeline();
  renderPreview();
}

async function generateWithAI() {
  const prompt = el('aiPrompt').value.trim();
  if (!prompt) { setStatus('Escreva uma descrição para o Diretor.'); return; }
  setStatus('Consultando a IA...');
  try {
    const script = await callLLM(loadAIConfig(), prompt);
    applyScript(script);
    setStatus(`Roteiro da IA: ${script.cenas.length} cenas. Toque ▶ ou exporte.`);
  } catch (e) {
    setStatus('IA: ' + e.message + ' — use "Gerar roteiro" (local) enquanto isso.');
  }
}

// ---------- Projeto (salvar/abrir) ----------
function currentProject() {
  return {
    character: state.character,
    timeline: state.timeline,
    titulo: state.titulo,
    background: el('bgSelect').value,
    surto: state.surto,
  };
}

function applyProject(proj) {
  if (proj.character) {
    state.character = normalizeCharacter(proj.character);
    state.activeCharacterId = proj.character.id || 'custom';
  }
  state.timeline = Array.isArray(proj.timeline) ? proj.timeline : [];
  state.titulo = proj.titulo || '';
  state.surto = Number(proj.surto) || 0;
  if (proj.background) el('bgSelect').value = proj.background;

  syncCharFields();
  buildPropSelect();
  refreshCharSelect();
  el('titleInput').value = state.titulo;
  el('surtoRange').value = state.surto;
  el('surtoVal').textContent = String(Math.round(state.surto));

  const first = state.timeline[0];
  if (first) {
    state.pose = normalizePose(first.angles);
    state.expression = first.expression || 'neutro';
    state.activePoseId = null;
    syncSliders();
    el('expressionSelect').value = state.expression;
  }
  renderTimeline();
  renderPreview();
}

// ---------- Animação (preview) ----------
let animTimer = null;
function playAnimation() {
  stopAnimation();
  const frames = timelineFrames();
  if (frames.length === 0) return;
  const fps = Number(el('fps').value) || 12;
  const loop = el('loopAnim').checked;
  state.playing = true;
  let i = 0;
  animTimer = setInterval(() => {
    if (!state.playing) return;
    const f = frames[i];
    const phase = frames.length > 1 ? i / frames.length : 0;
    const opts = renderOptions();
    stage.innerHTML = poseToSVG(f.angles, state.character, {
      ...opts,
      expression: f.expression,
      background: f.bg ?? opts.background,
      surto: f.surto ?? opts.surto,
      caption: f.caption ?? null,
      phase,
    });
    i++;
    if (i >= frames.length) {
      if (loop) i = 0;
      else stopAnimation();
    }
  }, 1000 / fps);
}
function stopAnimation() {
  state.playing = false;
  if (animTimer) clearInterval(animTimer);
  animTimer = null;
  renderPreview();
}

// ---------- Exportação ----------
async function doExportPng() {
  const frames = timelineFrames();
  setStatus(`Renderizando ${frames.length} PNGs...`);
  try {
    await exportPNGSequence(frames, state.character, renderOptions(), (i, t) =>
      setStatus(`Renderizando PNG ${i}/${t}...`)
    );
    setStatus(`Zip com ${frames.length} PNGs exportado.`);
  } catch (e) {
    setStatus('Erro ao exportar PNGs: ' + e.message);
  }
}

async function doExportWebm() {
  const frames = timelineFrames();
  const fps = Number(el('fps').value) || 12;
  setStatus('Gravando vídeo .webm...');
  try {
    await exportWebM(frames, state.character, renderOptions(), fps, (i, t) =>
      setStatus(`Gravando frame ${i}/${t}...`)
    );
    setStatus('Vídeo .webm exportado.');
  } catch (e) {
    setStatus('Erro ao exportar vídeo: ' + e.message);
  }
}

// ---------- Init ----------
function init() {
  buildSliders();
  buildExpressionSelect();
  buildBgSelect();
  buildCharFields();
  buildPropSelect();
  buildWardrobeSelects();
  refreshCharSelect();
  refreshAnimSelect();
  renderPoseList();

  // timeline inicial de demonstração: idle -> wave
  state.timeline = [
    { angles: normalizePose(defaultPoses[0].angles), expression: defaultPoses[0].expression, frames: 16 },
    { angles: normalizePose(defaultPoses[1].angles), expression: defaultPoses[1].expression, frames: 16 },
  ];
  renderTimeline();
  renderPreview();

  el('bgSelect').addEventListener('change', renderPreview);
  el('colorInput').addEventListener('input', () => {
    state.character.color = el('colorInput').value;
    renderPreview();
  });
  el('expressionSelect').addEventListener('change', (e) => {
    state.expression = e.target.value;
    renderPreview();
  });
  el('surtoRange').addEventListener('input', (e) => {
    state.surto = Number(e.target.value);
    el('surtoVal').textContent = String(state.surto);
    renderPreview();
  });
  startEffectTicker();

  // Personagem
  el('charSelect').addEventListener('change', (e) => applyCharacter(e.target.value));
  el('showFace').addEventListener('change', (e) => {
    state.character.showFace = e.target.checked;
    renderPreview();
  });
  el('tieToggle').addEventListener('change', (e) => {
    state.character.tie = e.target.checked;
    renderPreview();
  });
  el('tieColor').addEventListener('input', (e) => {
    state.character.tieColor = e.target.value;
    if (state.character.tie) renderPreview();
  });
  el('hairToggle').addEventListener('change', (e) => {
    state.character.hair = e.target.checked;
    renderPreview();
  });
  el('hairColor').addEventListener('input', (e) => {
    state.character.hairColor = e.target.value;
    if (state.character.hair) renderPreview();
  });
  el('hairStyle').addEventListener('change', (e) => {
    state.character.hairStyle = e.target.value;
    if (state.character.hair) renderPreview();
  });
  el('outfitSelect').addEventListener('change', (e) => {
    state.character.outfit = e.target.value;
    state.character.jacket = e.target.value === 'paleto'; // compat.
    renderPreview();
  });
  el('outfitColor').addEventListener('input', (e) => {
    state.character.outfitColor = e.target.value;
    state.character.jacketColor = e.target.value; // compat.
    renderPreview();
  });
  el('propSelect').addEventListener('change', (e) => {
    state.character.prop = e.target.value;
    renderPreview();
  });
  el('viewSelect').addEventListener('change', (e) => {
    state.character.view = e.target.value;
    renderPreview();
  });
  el('facingSelect').addEventListener('change', (e) => {
    state.character.facing = e.target.value;
    renderPreview();
  });
  el('saveChar').addEventListener('click', saveCurrentCharacter);
  el('resetChar').addEventListener('click', () => {
    const base = allCharacters().find((c) => c.id === state.activeCharacterId);
    if (base) {
      state.character = normalizeCharacter(base);
      syncCharFields();
      renderPreview();
      setStatus('Proporções restauradas.');
    }
  });
  el('delChar').addEventListener('click', () => {
    if (!isActiveCharCustom()) return;
    removeCustomCharacter(state.activeCharacterId);
    applyCharacter(defaultCharacters[0].id);
    setStatus('Personagem excluído.');
  });
  el('exportCharsJson').addEventListener('click', exportCustomCharactersFile);
  el('importCharsJson').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importCustomCharactersFile(file);
      refreshCharSelect();
      setStatus('Personagens importados.');
    } catch (err) {
      setStatus('Erro ao importar: ' + err.message);
    }
    e.target.value = '';
  });

  // Pose
  el('resetPose').addEventListener('click', () => {
    for (const k of ANGLE_KEYS) state.pose[k] = 0;
    state.activePoseId = null;
    syncSliders();
    renderPreview();
    renderPoseList();
  });
  el('savePose').addEventListener('click', saveCurrentPose);
  el('exportPosesJson').addEventListener('click', exportCustomPosesFile);
  el('importPosesJson').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importCustomPosesFile(file);
      renderPoseList();
      setStatus('Poses importadas.');
    } catch (err) {
      setStatus('Erro ao importar: ' + err.message);
    }
    e.target.value = '';
  });

  // Diretor de IA
  const aiCfg = loadAIConfig();
  el('aiEndpoint').value = aiCfg.endpoint || '';
  el('aiModel').value = aiCfg.model || '';
  el('aiKey').value = aiCfg.apiKey || '';
  el('titleInput').addEventListener('input', (e) => {
    state.titulo = e.target.value;
    renderPreview();
  });
  el('genLocal').addEventListener('click', () => {
    const prompt = el('aiPrompt').value.trim();
    if (!prompt) { setStatus('Escreva uma descrição para o Diretor.'); return; }
    applyScript(roteiroLocal(prompt));
    setStatus('Roteiro gerado (local). Toque ▶ ou exporte.');
  });
  el('genAI').addEventListener('click', generateWithAI);
  el('aiSave').addEventListener('click', () => {
    saveAIConfig({
      endpoint: el('aiEndpoint').value.trim(),
      model: el('aiModel').value.trim(),
      apiKey: el('aiKey').value.trim(),
    });
    setStatus('Config da IA salva.');
  });

  // Animações prontas
  el('animSelect').addEventListener('change', () => {
    el('delAnim').disabled = !isActiveAnimCustom();
  });
  el('loadAnim').addEventListener('click', loadAnimation);
  el('saveAnim').addEventListener('click', saveTimelineAsAnimation);
  el('delAnim').addEventListener('click', () => {
    if (!isActiveAnimCustom()) return;
    removeCustomAnimation(activeAnimId());
    refreshAnimSelect();
    setStatus('Animação excluída.');
  });
  el('exportAnimsJson').addEventListener('click', exportCustomAnimationsFile);
  el('importAnimsJson').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importCustomAnimationsFile(file);
      refreshAnimSelect();
      setStatus('Animações importadas.');
    } catch (err) {
      setStatus('Erro ao importar: ' + err.message);
    }
    e.target.value = '';
  });

  // Timeline
  el('addKeyframe').addEventListener('click', addKeyframe);
  el('clearTimeline').addEventListener('click', () => {
    state.timeline = [];
    renderTimeline();
    setStatus('Timeline limpa.');
  });
  el('playAnim').addEventListener('click', playAnimation);
  el('stopAnim').addEventListener('click', stopAnimation);

  // Export
  el('exportSvg').addEventListener('click', () => {
    exportSVG(state.pose, state.character, renderOptions());
    setStatus('SVG exportado.');
  });
  el('exportThumb').addEventListener('click', async () => {
    setStatus('Gerando thumbnail...');
    try {
      await exportThumbnail(state.pose, state.character, renderOptions(), 2);
      setStatus('Thumbnail PNG (2x) exportada.');
    } catch (e) {
      setStatus('Erro na thumbnail: ' + e.message);
    }
  });
  el('exportPng').addEventListener('click', doExportPng);
  el('exportWebm').addEventListener('click', doExportWebm);
  el('exportSrt').addEventListener('click', () => {
    try {
      exportSRT(state.timeline, Number(el('fps').value) || 12);
      setStatus('Legendas .srt exportadas.');
    } catch (e) {
      setStatus('SRT: ' + e.message);
    }
  });
  el('saveProject').addEventListener('click', () => {
    exportProjectFile(currentProject());
    setStatus('Projeto salvo (JSON).');
  });
  el('loadProject').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      applyProject(await importProjectFile(file));
      setStatus('Projeto carregado.');
    } catch (err) {
      setStatus('Erro ao abrir projeto: ' + err.message);
    }
    e.target.value = '';
  });
}

init();
