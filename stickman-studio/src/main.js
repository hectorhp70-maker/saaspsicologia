// main.js — orquestra o editor, os personagens, a biblioteca de poses,
// a timeline de quadros-chave e a exportação.

import { ANGLE_KEYS, ANGLE_META, EXPRESSIONS, normalizePose, poseToSVG } from './skeleton.js';
import { defaultCharacters, CHARACTER_FIELDS, normalizeCharacter } from './characters.js';
import { defaultPoses } from './poses.js';
import { defaultAnimations, cloneKeyframes } from './animations.js';
import { interpolatePoses } from './interpolate.js';
import {
  loadCustomPoses, upsertCustomPose, removeCustomPose, exportCustomPosesFile, importCustomPosesFile,
  loadCustomCharacters, upsertCustomCharacter, removeCustomCharacter, exportCustomCharactersFile, importCustomCharactersFile,
  loadCustomAnimations, upsertCustomAnimation, removeCustomAnimation, exportCustomAnimationsFile, importCustomAnimationsFile,
} from './storage.js';
import { exportSVG, exportPNGSequence, exportWebM } from './export.js';

// ---------- Estado ----------
const state = {
  character: normalizeCharacter(defaultCharacters[0]),
  activeCharacterId: defaultCharacters[0].id,
  pose: normalizePose(defaultPoses[0].angles),
  expression: defaultPoses[0].expression || 'neutro',
  activePoseId: 'idle',
  timeline: [], // [{ angles, expression, frames }]
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

// ---------- Personagens ----------
function allCharacters() {
  const custom = loadCustomCharacters().map((c) => ({ ...c, custom: true }));
  return [...defaultCharacters.map((c) => ({ ...c, custom: false })), ...custom];
}

function isActiveCharCustom() {
  return loadCustomCharacters().some((c) => c.id === state.activeCharacterId);
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

// Concatena a interpolação de cada trecho. Retorna [{ angles, expression }].
function timelineFrames() {
  const tl = state.timeline;
  if (tl.length === 0) return [{ angles: { ...state.pose }, expression: state.expression }];
  if (tl.length === 1) return [{ angles: { ...tl[0].angles }, expression: tl[0].expression }];
  const out = [];
  for (let i = 0; i < tl.length - 1; i++) {
    const seg = interpolatePoses(normalizePose(tl[i].angles), normalizePose(tl[i + 1].angles), tl[i].frames);
    let frames = seg.map((a) => ({ angles: a, expression: tl[i].expression }));
    if (i > 0) frames = frames.slice(1); // evita duplicar o quadro de junção
    out.push(...frames);
  }
  return out;
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
    stage.innerHTML = poseToSVG(f.angles, state.character, { ...renderOptions(), expression: f.expression });
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
  buildCharFields();
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

  // Personagem
  el('charSelect').addEventListener('change', (e) => applyCharacter(e.target.value));
  el('showFace').addEventListener('change', (e) => {
    state.character.showFace = e.target.checked;
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
  el('exportPng').addEventListener('click', doExportPng);
  el('exportWebm').addEventListener('click', doExportWebm);
}

init();
