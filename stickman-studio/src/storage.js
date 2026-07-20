// storage.js
// Persistência local das poses customizadas via localStorage.

const KEY = 'stickman-studio:custom-poses:v1';
const CHAR_KEY = 'stickman-studio:custom-characters:v1';
const ANIM_KEY = 'stickman-studio:custom-animations:v1';
const AI_KEY = 'stickman-studio:ai-config:v1';

export function loadCustomPoses() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCustomPoses(poses) {
  localStorage.setItem(KEY, JSON.stringify(poses));
}

// Adiciona (ou substitui, se o id já existir) uma pose customizada.
export function upsertCustomPose(pose) {
  const poses = loadCustomPoses();
  const idx = poses.findIndex((p) => p.id === pose.id);
  if (idx >= 0) poses[idx] = pose;
  else poses.push(pose);
  saveCustomPoses(poses);
  return poses;
}

export function removeCustomPose(id) {
  const poses = loadCustomPoses().filter((p) => p.id !== id);
  saveCustomPoses(poses);
  return poses;
}

// Exporta as poses customizadas como arquivo JSON (download).
export function exportCustomPosesFile() {
  const data = JSON.stringify(loadCustomPoses(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'poses-customizadas.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Importa poses de um arquivo JSON e mescla com as existentes.
export async function importCustomPosesFile(file) {
  const text = await file.text();
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) throw new Error('JSON inválido: esperado um array de poses.');
  let poses = loadCustomPoses();
  for (const p of arr) {
    if (!p.id || !p.angles) continue;
    const idx = poses.findIndex((x) => x.id === p.id);
    if (idx >= 0) poses[idx] = p;
    else poses.push(p);
  }
  saveCustomPoses(poses);
  return poses;
}

// ---------- Personagens customizados ----------
export function loadCustomCharacters() {
  try {
    const raw = localStorage.getItem(CHAR_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCustomCharacters(chars) {
  localStorage.setItem(CHAR_KEY, JSON.stringify(chars));
}

export function upsertCustomCharacter(char) {
  const chars = loadCustomCharacters();
  const idx = chars.findIndex((c) => c.id === char.id);
  if (idx >= 0) chars[idx] = char;
  else chars.push(char);
  saveCustomCharacters(chars);
  return chars;
}

export function removeCustomCharacter(id) {
  const chars = loadCustomCharacters().filter((c) => c.id !== id);
  saveCustomCharacters(chars);
  return chars;
}

export function exportCustomCharactersFile() {
  const data = JSON.stringify(loadCustomCharacters(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'personagens-customizados.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importCustomCharactersFile(file) {
  const text = await file.text();
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) throw new Error('JSON inválido: esperado um array de personagens.');
  let chars = loadCustomCharacters();
  for (const c of arr) {
    if (!c.id) continue;
    const idx = chars.findIndex((x) => x.id === c.id);
    if (idx >= 0) chars[idx] = c;
    else chars.push(c);
  }
  saveCustomCharacters(chars);
  return chars;
}

// ---------- Animações customizadas ----------
export function loadCustomAnimations() {
  try {
    const raw = localStorage.getItem(ANIM_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCustomAnimations(anims) {
  localStorage.setItem(ANIM_KEY, JSON.stringify(anims));
}

export function upsertCustomAnimation(anim) {
  const anims = loadCustomAnimations();
  const idx = anims.findIndex((x) => x.id === anim.id);
  if (idx >= 0) anims[idx] = anim;
  else anims.push(anim);
  saveCustomAnimations(anims);
  return anims;
}

export function removeCustomAnimation(id) {
  const anims = loadCustomAnimations().filter((x) => x.id !== id);
  saveCustomAnimations(anims);
  return anims;
}

export function exportCustomAnimationsFile() {
  const data = JSON.stringify(loadCustomAnimations(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'animacoes-customizadas.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importCustomAnimationsFile(file) {
  const text = await file.text();
  const arr = JSON.parse(text);
  if (!Array.isArray(arr)) throw new Error('JSON inválido: esperado um array de animações.');
  let anims = loadCustomAnimations();
  for (const an of arr) {
    if (!an.id || !Array.isArray(an.keyframes)) continue;
    const idx = anims.findIndex((x) => x.id === an.id);
    if (idx >= 0) anims[idx] = an;
    else anims.push(an);
  }
  saveCustomAnimations(anims);
  return anims;
}

// ---------- Config da IA (Diretor) ----------
export function loadAIConfig() {
  try {
    return JSON.parse(localStorage.getItem(AI_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveAIConfig(cfg) {
  localStorage.setItem(AI_KEY, JSON.stringify(cfg || {}));
}
