import { existsSync, readFileSync } from 'node:fs';
import curriculum from '../src/data/curriculum.json';
const ids = new Set<string>();
for (const word of curriculum.vocabulary) {
  if (ids.has(word.id)) throw new Error(`Duplicate vocabulary ID: ${word.id}`);
  ids.add(word.id);
  if (word.status === 'ready') {
    for (const asset of [word.image, word.audio, `/audio/choose-${word.id}.wav`, `/audio/assist-${word.id}.wav`]) {
      if (!asset || !existsSync(`public${asset}`)) throw new Error(`Missing asset: ${asset}`);
    }
    const audio = readFileSync(`public${word.audio}`);
    if (audio.toString('ascii', 0, 4) !== 'RIFF' || audio.length < 1000) throw new Error(`Invalid WAV: ${word.audio}`);
  }
}
for (const topic of curriculum.topics) for (const id of topic.sequence) {
  const word = curriculum.vocabulary.find(w => w.id === id);
  if (!word || word.topicId !== topic.id) throw new Error(`Invalid topic reference: ${id}`);
}
for (const id of curriculum.adventure.wordIds) {
  if (!curriculum.vocabulary.some(w => w.id === id && w.status === 'ready')) throw new Error(`Unavailable adventure word: ${id}`);
}
for (const asset of ['/images/bunny.png', '/audio/welcome.wav', '/audio/correct.wav', '/audio/retry.wav', '/audio/celebrate.wav', '/audio/sticker.wav', '/icon-192.png', '/icon-512.png']) {
  if (!existsSync(`public${asset}`)) throw new Error(`Missing shared asset: ${asset}`);
}
console.log(`Content valid: ${curriculum.vocabulary.length} vocabulary records, ${curriculum.adventure.wordIds.length} playable words.`);
