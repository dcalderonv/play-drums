/* Keeps a copy of the app so it opens without a connection.
   The app's own files are fetched fresh when online and fall back to the copy when not, so a new
   version arrives on the next visit and the HTML, CSS and script never come from different versions.
   Fonts never change, so they are served from the copy first. Raise VERSION when the file list changes. */
const VERSION = 'play-drums-v2';
const FONTS = 'play-drums-fonts';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './tokens.css',
  './base.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  // The recorded kit: three strengths of each drum.
  ...['crash', 'ride', 'openhat', 'hihat', 'hightom', 'snare', 'crossstick', 'floortom', 'kick', 'hatfoot']
    .flatMap((d) => ['soft', 'medium', 'hard'].map((s) => `./sounds/${d}-${s}.wav`)),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONTS).then((cache) => cache.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
        return res;
      }))),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // no-cache asks the server whether the file changed, instead of trusting the browser's own copy
  // (GitHub Pages lets browsers keep files for ten minutes, which would hide a fresh push).
  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) {
          // An exercise link like ?ex=samba is the same page, so it is stored once, without the query.
          const key = req.mode === 'navigate' ? './index.html' : req;
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(key, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))),
  );
});
