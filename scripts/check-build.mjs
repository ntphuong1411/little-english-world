import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const base = process.env.BASE_PATH || '/little-english-world/';
const origin = 'https://ntphuong1411.github.io';
function assetFile(url) {
  const pathname = new URL(url, origin).pathname;
  assert.ok(pathname.startsWith(base), `Asset outside app base: ${pathname}`);
  const relative = pathname.slice(base.length) || 'index.html';
  const filename = path.resolve('dist', relative);
  assert.ok(filename.startsWith(path.resolve('dist') + path.sep));
  assert.ok(existsSync(filename), `Missing built asset: ${filename}`);
  return filename;
}
const html = readFileSync('dist/index.html', 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) assetFile(match[1]);
const manifestUrl = origin + base + 'manifest.webmanifest';
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));
assert.equal(new URL(manifest.start_url, manifestUrl).pathname, base);
assert.equal(new URL(manifest.scope, manifestUrl).pathname, base);
for (const icon of manifest.icons) assetFile(new URL(icon.src, manifestUrl).href);

// Contract test for generated worker. This is not a real-browser offline test.
const handlers = {};
const stored = new Map();
const cache = {
  async addAll(urls) { for (const url of urls) { assetFile(url); stored.set(new URL(url, origin).pathname, { cachedUrl: url }); } },
  async match(request) { return stored.get(new URL(typeof request === 'string' ? request : request.url, origin).pathname); },
};
vm.runInNewContext(readFileSync('dist/sw.js', 'utf8'), {
  URL, Response,
  self: { location: { origin }, addEventListener: (name, handler) => { handlers[name] = handler; }, clients: { claim: async () => {}, matchAll: async () => [] } },
  caches: { open: async () => cache, keys: async () => [], delete: async () => true },
  fetch: async () => { throw new Error('Simulated offline'); },
});
let installation;
handlers.install({ waitUntil: promise => { installation = promise; } });
await installation;
async function request(pathname, mode = 'cors') {
  let response;
  handlers.fetch({ request: { method: 'GET', url: origin + pathname, mode }, respondWith: promise => { response = promise; } });
  return response;
}
assert.equal((await request(base, 'navigate')).cachedUrl, base);
assert.equal((await request(base + 'images/spoon.png')).cachedUrl, base + 'images/spoon.png');
assert.equal((await request(base + 'audio/spoon.wav')).cachedUrl, base + 'audio/spoon.wav');
assert.equal((await request(base + 'unavailable-route', 'navigate')).cachedUrl, base + 'index.html');
assert.equal(await request('/another-project/'), undefined);
assert.equal(await request(base + 'sw.js'), undefined);
console.log(`Built paths, manifest, ${stored.size} precache entries and simulated offline navigation/image/audio passed.`);
