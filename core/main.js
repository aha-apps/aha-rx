// main.js — Punto de entrada principal
'use strict';

(function () {
  console.log('🏥 AHA Rx v' + APP_CONFIG.app.version + ' iniciando...');

  // Inicializar network store
  if (typeof Alpine !== 'undefined') {
    Alpine.store('network', { online: navigator.onLine });
    Alpine.store('loading', { phase: 'ready', visible: false });
  }

  window.addEventListener('load', function () {
    // Registrar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        console.log('✅ SW registrado');
      }).catch(function (err) {
        console.warn('⚠️ SW no registrado:', err.message);
      });
    }
  });

  console.log('✅ AHA Rx listo');
})();
