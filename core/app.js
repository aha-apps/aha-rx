// app.js — Router hash-based y gestor de m\u00f3dulos
'use strict';

window.appRouter = {
  currentModule: null,
  modules: {},
  contentEl: null,

  init: function () {
    var self = this;
    this.contentEl = document.getElementById('main-content');
    if (!this.contentEl) {
      console.error('❌ #main-content no encontrado');
      return;
    }

    window.addEventListener('hashchange', function () {
      self.route();
    });

    this.route();

    // Inicializar Alpine stores
    if (typeof Alpine !== 'undefined') {
      Alpine.store('app', {
        nombre: APP_CONFIG.app.nombre,
        version: APP_CONFIG.app.version,
        plan: APP_CONFIG.app.plan
      });
    }

    console.log('🚀 appRouter iniciado');
  },

  route: function () {
    var hash = window.location.hash.replace('#', '') || 'pacientes';
    var self = this;
    this.cargarModulo(hash);
  },

  navigate: function (moduloId, params) {
    window.location.hash = '#' + moduloId;
  },

  cargarModulo: function (moduloId) {
    var self = this;

    // Destruir m\u00f3dulo anterior
    if (this.currentModule && window.MODULES[this.currentModule]) {
      var oldMod = window.MODULES[this.currentModule];
      if (typeof oldMod.destroy === 'function') {
        try { oldMod.destroy(); } catch (e) { console.warn(e); }
      }
    }

    this.currentModule = moduloId;

    // Verificar que est\u00e9 en modulosActivos
    if (!APP_CONFIG.modulosActivos || APP_CONFIG.modulosActivos.indexOf(moduloId) === -1) {
      this.contentEl.innerHTML = '<div class="flex flex-col items-center justify-center py-20 text-base-content/50"><i class="bi bi-exclamation-triangle text-6xl mb-4"></i><p class="text-lg">M\u00f3dulo no encontrado</p></div>';
      return;
    }

    // Cargar HTML del m\u00f3dulo
    var htmlPath = 'modules/' + moduloId + '/module.html';
    fetch(htmlPath).then(function (res) {
      if (!res.ok) throw new Error('Error al cargar ' + htmlPath);
      return res.text();
    }).then(function (html) {
      self.contentEl.innerHTML = html;
      // Cargar JS del m\u00f3dulo si existe
      var jsPath = 'modules/' + moduloId + '/module.js';
      var script = document.createElement('script');
      script.src = jsPath;
      script.onload = function () {
        var mod = window.MODULES[moduloId];
        if (mod) {
          if (typeof mod.init === 'function') mod.init();
          if (typeof mod.render === 'function') mod.render();
        }
      };
      script.onerror = function () {
        console.warn('⚠️ No se pudo cargar ' + jsPath);
      };
      document.body.appendChild(script);
    }).catch(function (err) {
      self.contentEl.innerHTML = '<div class="flex flex-col items-center justify-center py-20 text-base-content/50"><i class="bi bi-exclamation-triangle text-6xl mb-4"></i><p class="text-lg">Error al cargar m\u00f3dulo</p><p class="text-sm mt-2">' + err.message + '</p></div>';
    });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.appRouter.init();
});
