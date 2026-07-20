// storage.js
// Persistência local das poses customizadas via localStorage.

const KEY = 'stickman-studio:custom-poses:v1';

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
