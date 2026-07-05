// sw.js — Service Worker offline-first para AHA Rx
var CACHE = 'aha-rx-v1';
var ASSETS = [
  '/',
  'index.html',
  'core/env.js',
  'core/db.js',
  'core/crypto.js',
  'core/ui.js',
  'core/theme.js',
  'core/app.js',
  'core/search-palette.js',
  'core/file-store.js',
  'core/sync.js',
  'core/license.js',
  'core/network.js',
  'core/main.js',
  'modules/pacientes/module.html',
  'modules/pacientes/module.js',
  'modules/medicamentos/module.html',
  'modules/medicamentos/module.js',
  'modules/recetas/module.html',
  'modules/recetas/module.js',
  'modules/historial/module.html',
  'modules/historial/module.js',
  'modules/estadisticas/module.html',
  'modules/estadisticas/module.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () { return caches.match('index.html'); })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function (r) { return r || fetch(req); })
  );
});
