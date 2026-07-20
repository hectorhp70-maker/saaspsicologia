// export.js
// Exportação: SVG único, sequência de PNGs (zip) e vídeo .webm.

import JSZip from 'jszip';
import { poseToSVG } from './skeleton.js';

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- SVG único ---------------------------------------------------------------
export function exportSVG(pose, character, options) {
  const svg = poseToSVG(pose, character, options);
  download(new Blob([svg], { type: 'image/svg+xml' }), 'stickman.svg');
}

// Converte uma string SVG num canvas (Promise). background 'transparent' mantém alfa.
function svgToCanvas(svg, width, height, background) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (background === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type = 'image/png') {
  return new Promise((resolve) => canvas.toBlob(resolve, type));
}

// Renderiza cada frame (pose) para PNG e empacota num zip.
// frames: array de ângulos. onProgress(i, total) opcional.
export async function exportPNGSequence(frames, character, options, onProgress) {
  const zip = new JSZip();
  const width = options.width ?? 400;
  const height = options.height ?? 500;
  const bg = options.background ?? 'white';
  const pad = String(frames.length).length;

  for (let i = 0; i < frames.length; i++) {
    const svg = poseToSVG(frames[i], character, options);
    const canvas = await svgToCanvas(svg, width, height, bg);
    const blob = await canvasToBlob(canvas, 'image/png');
    const name = `frame_${String(i + 1).padStart(pad, '0')}.png`;
    zip.file(name, blob);
    onProgress?.(i + 1, frames.length);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  download(content, 'stickman-sequencia-png.zip');
}

// Gera um vídeo .webm desenhando os frames num canvas + MediaRecorder.
// fps ajustável. onProgress(i, total) opcional.
export async function exportWebM(frames, character, options, fps = 12, onProgress) {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder não é suportado neste navegador.');
  }
  const width = options.width ?? 400;
  const height = options.height ?? 500;
  const bg = options.background ?? 'white';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Pré-renderiza cada frame como imagem para desenho síncrono.
  const images = [];
  for (let i = 0; i < frames.length; i++) {
    const svg = poseToSVG(frames[i], character, options);
    const c = await svgToCanvas(svg, width, height, bg);
    images.push(c);
  }

  const stream = canvas.captureStream(fps);
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';
  const recorder = new MediaRecorder(stream, { mimeType: mime });
  const chunks = [];
  recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

  const done = new Promise((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));
  });

  recorder.start();
  const frameDelay = 1000 / fps;
  for (let i = 0; i < images.length; i++) {
    if (bg === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
    ctx.drawImage(images[i], 0, 0);
    onProgress?.(i + 1, images.length);
    await new Promise((r) => setTimeout(r, frameDelay));
  }
  // segura o último frame um instante para não cortar
  await new Promise((r) => setTimeout(r, frameDelay * 2));
  recorder.stop();

  const blob = await done;
  download(blob, 'stickman.webm');
}
