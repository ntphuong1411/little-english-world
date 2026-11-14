import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const dist = path.resolve('dist');
const base = process.env.BASE_PATH || '/little-english-world/';
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('BASE_PATH must start and end with /');
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const parts = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)));
  return parts.flat();
}
const files = (await walk(dist)).filter(file => !file.endsWith(`${path.sep}sw.js`));
const hash = createHash('sha256');
for (const file of files.sort()) { hash.update(file.slice(dist.length)); hash.update(await readFile(file)); }
const prefix = `lew-${createHash('sha256').update(base).digest('hex').slice(0, 8)}-`;
const version = `${prefix}${hash.digest('hex').slice(0, 12)}`;
const urls = files.map(file => base + path.relative(dist, file).replaceAll('\\', '/'));
const worker = `const CACHE = ${JSON.stringify(version)};
const BASE = ${JSON.stringify(base)};
const ASSETS = ${JSON.stringify([base, ...urls])};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(${JSON.stringify(prefix)}) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()).then(async () => {
    const clients = await self.clients.matchAll(); clients.forEach(client => client.postMessage({type:'OFFLINE_READY'}));
  }));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'STATUS') event.source?.postMessage({type:'OFFLINE_READY'});
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (url.pathname === BASE + 'sw.js') return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request, {ignoreSearch:true});
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch (error) {
      if (event.request.mode === 'navigate') return (await cache.match(BASE + 'index.html')) || Response.error();
      return Response.error();
    }
  }));
});`;
await writeFile(path.join(dist, 'sw.js'), worker);
console.log(`Service worker: ${version}; ${urls.length} precached files. Updates activate after old tabs close.`);
