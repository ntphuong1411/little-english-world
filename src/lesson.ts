import curriculum from './data/curriculum.json';

export type Word = { id: string; word: string; meaningVi: string; topicId: string; image: string; audio: string; status: 'ready' };
export type LessonSize = 2 | 3 | 5;
export type Progress = {
  version: 1;
  size: LessonSize;
  completedGroups: string[];
  stickers: string[];
  encounters: Record<string, { independent: number; assisted: number }>;
};
export const initialProgress = (): Progress => ({ version: 1, size: 3, completedGroups: [], stickers: [], encounters: {} });
export const readyWords = curriculum.vocabulary.filter((w) => w.status === 'ready') as Word[];
export const adventure = curriculum.adventure;
export const lessonWords = (size: LessonSize): Word[] => {
  const ids = adventure.wordIds.slice(0, size);
  return ids.map((id) => {
    const word = readyWords.find((w) => w.id === id);
    if (!word) throw new Error(`Unavailable vocabulary: ${id}`);
    return word;
  });
};
export const groupKey = (words: Word[]) => `${adventure.id}@${adventure.revision}:${words.map((w) => w.id).join(',')}`;

export type Phase = 'welcome' | 'explore' | 'choose' | 'celebrate' | 'sticker';
export type Session = {
  phase: Phase; words: Word[]; index: number; wrong: number;
  result: 'none' | 'retry' | 'assist' | 'correct'; independent: number;
  answers: Record<string, 'independent' | 'assisted'>;
};
export type Action = { type: 'continue' } | { type: 'answer'; id: string };
export const newSession = (words: Word[]): Session => ({ phase: 'welcome', words, index: 0, wrong: 0, result: 'none', independent: 0, answers: {} });
export function sessionReducer(s: Session, a: Action): Session {
  if (a.type === 'answer') {
    if (s.phase !== 'choose' || s.result === 'correct') return s;
    const target = s.words[s.index];
    if (a.id !== target.id) {
      if (s.result === 'assist') return s;
      const wrong = s.wrong + 1;
      return { ...s, wrong, result: wrong >= 2 ? 'assist' : 'retry' };
    }
    const independent = s.wrong < 2;
    return { ...s, result: 'correct', independent: s.independent + (independent ? 1 : 0), answers: { ...s.answers, [target.id]: independent ? 'independent' : 'assisted' } };
  }
  if (s.phase === 'welcome') return { ...s, phase: 'explore' };
  if (s.phase === 'explore') {
    return s.index + 1 < s.words.length ? { ...s, index: s.index + 1 } : { ...s, phase: 'choose', index: 0 };
  }
  if (s.phase === 'choose' && s.result === 'correct') {
    return s.index + 1 < s.words.length
      ? { ...s, index: s.index + 1, wrong: 0, result: 'none' }
      : { ...s, phase: 'celebrate', index: 0 };
  }
  if (s.phase === 'celebrate') return { ...s, phase: 'sticker' };
  return s;
}

export function choices(s: Session): Word[] {
  const target = s.words[s.index];
  // The current result must not change the picture layout before Continue.
  const priorIndependent = s.independent - (s.result === 'correct' && s.answers[target.id] === 'independent' ? 1 : 0);
  const count = priorIndependent > 0 && s.words.length >= 3 ? 3 : 2;
  const others = s.words.filter((w) => w.id !== target.id).slice(0, count - 1);
  const pool = [target, ...others];
  // Rotate positions independently of correctness; keep choices stable after mistakes.
  const offset = (s.index + 1) % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)];
}

export function complete(progress: Progress, s: Session): Progress {
  const key = groupKey(s.words);
  const encounters = { ...progress.encounters };
  for (const [id, answer] of Object.entries(s.answers)) {
    const previous = encounters[id] ?? { independent: 0, assisted: 0 };
    encounters[id] = { ...previous, [answer]: previous[answer] + 1 };
  }
  return { ...progress, encounters, completedGroups: [...new Set([...progress.completedGroups, key])], stickers: [...new Set([...progress.stickers, adventure.stickerId])] };
}

export const STORAGE_KEY = 'little-english-world:v1';
export function parseProgress(raw: string | null): Progress {
  if (!raw) return initialProgress();
  try {
    const p = JSON.parse(raw);
    if (p.version !== 1 || ![2, 3, 5].includes(p.size) || !Array.isArray(p.completedGroups) || !p.completedGroups.every((v: unknown) => typeof v === 'string') || !Array.isArray(p.stickers) || !p.stickers.every((v: unknown) => typeof v === 'string') || !p.encounters || typeof p.encounters !== 'object' || Array.isArray(p.encounters)) return initialProgress();
    const validEncounters = Object.values(p.encounters).every((v: any) => v && Number.isSafeInteger(v.independent) && v.independent >= 0 && Number.isSafeInteger(v.assisted) && v.assisted >= 0);
    return validEncounters ? p : initialProgress();
  } catch { return initialProgress(); }
}
