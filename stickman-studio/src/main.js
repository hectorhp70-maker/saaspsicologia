// main.js — orquestra o editor, a biblioteca de poses, a animação e a exportação.

import { defaultCharacter, ANGLE_KEYS, ANGLE_META, normalizePose, poseToSVG } from './skeleton.js';
import { defaultCharacters, CHARACTER_FIELDS, normalizeCharacter } from './characters.js';
import { defaultPoses } from './poses.js';
import { interpolatePoses } from './interpolate.js';
import {
  loadCustomPoses, upsertCustomPose, removeCustomPose, exportCustomPosesFile, importCustomPosesFile,
  loadCustomCharacters, upsertCustomCharacter, removeCustomCharacter, exportCustomCharactersFile, importCustomCharactersFile,
} from './storage.js';
import { exportSVG, exportPNGSequence, exportWebM } from './export.js';

// ---------- Estado ----------
const state = {
  character: normalizeCharacter(defaultCharacters[0]),
  activeCharacterId: defaultCharacters[0].id,
  pose: normalizePose(defaultPoses[0].angles),
  activePoseId: 'idle',
  playing: false,
};

const el = (id) => document.getElementById(id);
const stage = el('stage');
const statusEl = el('status');

function renderOptions() {
  return {
    background: el('bgSelect').value,
    color: el('colorInput').value,
    width: 400,
    height: 500,
  };
}

function renderPreview() {
  stage.innerHTML = poseToSVG(state.pose, state.character, renderOptions());
}

// ---------- Sliders ----------
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
  if (!nome) {
    setStatus('Dê um nome para o personagem antes de salvar.');
    return;
  }
  const id = slugify(nome) + '-' + Date.now().toString(36).slice(-4);
  const char = normalizeCharacter({ ...state.character, id, nome });
  upsertCustomCharacter(char);
  el('charName').value = '';
  state.activeCharacterId = id;
  refreshCharSelect();
  el('charSelect').value = id;
  setStatus(`Personagem "${nome}" salvo localmente.`);
}

// ---------- Biblioteca ----------
function allPoses() {
  const custom = loadCustomPoses().map((p) => ({ ...p, custom: true }));
  return [...defaultPoses.map((p) => ({ ...p, custom: false })), ...custom];
}

function applyPose(pose, id) {
  state.pose = normalizePose(pose.angles);
  state.activePoseId = id;
  syncSliders();
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
      refreshAnimSelectors();
    })
  );
}

// ---------- Seletores de animação ----------
function refreshAnimSelectors() {
  const poses = allPoses();
  for (const selId of ['fromPose', 'toPose']) {
    const sel = el(selId);
    const prev = sel.value;
    sel.innerHTML = poses.map((p) => `<option value="${p.id}">${p.nome || p.id}</option>`).join('');
    if (poses.some((p) => p.id === prev)) sel.value = prev;
  }
  el('fromPose').value = 'idle';
  el('toPose').value = 'wave';
}

function getFrames() {
  const poses = allPoses();
  const from = poses.find((p) => p.id === el('fromPose').value)?.angles;
  const to = poses.find((p) => p.id === el('toPose').value)?.angles;
  const n = Number(el('frames').value) || 24;
  return interpolatePoses(normalizePose(from || {}), normalizePose(to || {}), n);
}

// ---------- Animação (preview) ----------
let animTimer = null;
function playAnimation() {
  stopAnimation();
  const frames = getFrames();
  const fps = Number(el('fps').value) || 12;
  state.playing = true;
  let i = 0;
  animTimer = setInterval(() => {
    if (!state.playing) return;
    stage.innerHTML = poseToSVG(frames[i], state.character, renderOptions());
    i = (i + 1) % frames.length;
  }, 1000 / fps);
}
function stopAnimation() {
  state.playing = false;
  if (animTimer) clearInterval(animTimer);
  animTimer = null;
  renderPreview();
}

// ---------- Salvar pose ----------
function slugify(s) {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'pose';
}

function saveCurrentPose() {
  const nome = el('poseName').value.trim();
  if (!nome) {
    setStatus('Dê um nome para a pose antes de salvar.');
    return;
  }
  const id = slugify(nome) + '-' + Date.now().toString(36).slice(-4);
  upsertCustomPose({ id, nome, angles: { ...state.pose } });
  el('poseName').value = '';
  state.activePoseId = id;
  renderPoseList();
  refreshAnimSelectors();
  setStatus(`Pose "${nome}" salva localmente.`);
}

// ---------- Exportação ----------
function setStatus(msg) { statusEl.textContent = msg; }

async function doExportPng() {
  const frames = getFrames();
  setStatus(`Renderizando ${frames.length} PNGs...`);
  try {
    await exportPNGSequence(frames, state.character, renderOptions(), (i, t) =>
      setStatus(`Renderizando PNG ${i}/${t}...`)
    );
    setStatus('Zip de PNGs exportado.');
  } catch (e) {
    setStatus('Erro ao exportar PNGs: ' + e.message);
  }
}

async function doExportWebm() {
  const frames = getFrames();
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

// ---------- Wire up ----------
function init() {
  buildSliders();
  buildCharFields();
  refreshCharSelect();
  renderPreview();
  renderPoseList();
  refreshAnimSelectors();

  el('bgSelect').addEventListener('change', renderPreview);
  el('colorInput').addEventListener('input', () => {
    state.character.color = el('colorInput').value;
    renderPreview();
  });

  // Personagem
  el('charSelect').addEventListener('change', (e) => applyCharacter(e.target.value));
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
  el('resetPose').addEventListener('click', () => {
    for (const k of ANGLE_KEYS) state.pose[k] = 0;
    state.activePoseId = null;
    syncSliders();
    renderPreview();
    renderPoseList();
  });
  el('savePose').addEventListener('click', saveCurrentPose);

  el('playAnim').addEventListener('click', playAnimation);
  el('stopAnim').addEventListener('click', stopAnimation);

  el('exportSvg').addEventListener('click', () => {
    exportSVG(state.pose, state.character, renderOptions());
    setStatus('SVG exportado.');
  });
  el('exportPng').addEventListener('click', doExportPng);
  el('exportWebm').addEventListener('click', doExportWebm);

  el('exportPosesJson').addEventListener('click', exportCustomPosesFile);
  el('importPosesJson').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importCustomPosesFile(file);
      renderPoseList();
      refreshAnimSelectors();
      setStatus('Poses importadas.');
    } catch (err) {
      setStatus('Erro ao importar: ' + err.message);
    }
    e.target.value = '';
  });
}

init();
