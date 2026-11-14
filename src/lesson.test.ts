import { describe, expect, it } from 'vitest';
import { choices, complete, initialProgress, lessonWords, newSession, parseProgress, sessionReducer, type Session } from './lesson';

function quiz(size: 2 | 3 = 3) {
  let s = newSession(lessonWords(size));
  s = sessionReducer(s, { type: 'continue' });
  for (let i = 0; i < size; i++) s = sessionReducer(s, { type: 'continue' });
  return s;
}
function finish(s: Session, assisted = false) {
  while (s.phase === 'choose') {
    if (assisted) {
      const other = choices(s).find(w => w.id !== s.words[s.index].id)!;
      s = sessionReducer(s, { type: 'answer', id: other.id });
      s = sessionReducer(s, { type: 'answer', id: other.id });
    }
    s = sessionReducer(s, { type: 'answer', id: s.words[s.index].id });
    s = sessionReducer(s, { type: 'continue' });
  }
  return sessionReducer(s, { type: 'continue' });
}
describe('guided adventure', () => {
  it('requires a correct or assisted answer before continuing', () => {
    const s = quiz();
    expect(sessionReducer(s, { type: 'continue' })).toBe(s);
  });
  it('highlights the target after two errors, then waits for the child to tap it', () => {
    let s = quiz();
    const wrong = choices(s).find(w => w.id !== s.words[s.index].id)!;
    s = sessionReducer(s, { type: 'answer', id: wrong.id });
    expect(s.result).toBe('retry');
    s = sessionReducer(s, { type: 'answer', id: wrong.id });
    expect(s.result).toBe('assist');
    expect(s.answers).toEqual({});
    s = sessionReducer(s, { type: 'answer', id: s.words[s.index].id });
    expect(s.answers.spoon).toBe('assisted');
    expect(s.independent).toBe(0);
  });
  it('progresses from two choices to three after a completed unassisted round', () => {
    let s = quiz();
    expect(choices(s)).toHaveLength(2);
    s = sessionReducer(s, { type: 'answer', id: 'spoon' });
    s = sessionReducer(s, { type: 'continue' });
    expect(choices(s)).toHaveLength(3);
    expect(new Set(choices(s).map(w => w.id)).size).toBe(3);
    expect(choices(s).map(w => w.id)).toContain(s.words[s.index].id);
  });
  it('never requests three choices in a two-word session', () => {
    let s = quiz(2);
    s = sessionReducer(s, { type: 'answer', id: 'spoon' });
    s = sessionReducer(s, { type: 'continue' });
    expect(choices(s)).toHaveLength(2);
  });
  it('keeps the same pictures in place during correct feedback', () => {
    const before = quiz();
    const after = sessionReducer(before, { type: 'answer', id: 'spoon' });
    expect(choices(after).map(w => w.id)).toEqual(choices(before).map(w => w.id));
    expect(choices(sessionReducer(after, { type: 'continue' }))).toHaveLength(3);
  });
  it('awards the same sticker for all-assisted completion and never duplicates it on replay', () => {
    const s = finish(quiz(), true);
    expect(s.phase).toBe('sticker');
    const progress = complete(initialProgress(), s);
    expect(progress.stickers).toEqual(['little-chef']);
    expect(progress.encounters.spoon).toEqual({ independent: 0, assisted: 1 });
    const replay = complete(progress, s);
    expect(replay.stickers).toHaveLength(1);
    expect(replay.completedGroups).toHaveLength(1);
    expect(replay.encounters.spoon.assisted).toBe(2);
  });
  it('does not count duplicate answer events after a correct selection', () => {
    let s = quiz();
    s = sessionReducer(s, { type: 'answer', id: 'spoon' });
    expect(sessionReducer(s, { type: 'answer', id: 'spoon' })).toBe(s);
  });
});
describe('local progress', () => {
  it('restores valid progress, including non-ASCII data safely', () => {
    const p = complete(initialProgress(), finish(quiz()));
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
  });
  it.each(['{broken', '{"version":2}', '{"version":1,"size":3,"completedGroups":[5],"stickers":[],"encounters":{}}', '{"version":1,"size":3,"completedGroups":[],"stickers":[],"encounters":{"spoon":{"independent":-1,"assisted":0}}}'])('recovers from malformed storage: %s', raw => {
    expect(parseProgress(raw)).toEqual(initialProgress());
  });
});
