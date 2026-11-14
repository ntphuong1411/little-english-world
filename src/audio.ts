import { assetUrl } from './assets';
let current: HTMLAudioElement | undefined;
export function stopAudio() {
  if (current) { current.pause(); current.currentTime = 0; current = undefined; }
}
export async function playAudio(path: string): Promise<boolean> {
  stopAudio();
  const audio = new Audio(assetUrl(path));
  current = audio;
  try { await audio.play(); return true; }
  catch { return false; }
}
