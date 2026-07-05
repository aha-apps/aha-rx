// theme.js — Inyecci\u00f3n de variables CSS desde APP_CONFIG
'use strict';

window.themeStore = {
  aplicar: function () {
    var colores = APP_CONFIG.tema.colores;
    var root = document.documentElement;
    for (var key in colores) {
      if (colores.hasOwnProperty(key)) {
        root.style.setProperty('--' + key, colores[key]);
      }
    }
    root.style.setProperty('--rounded-box', '1rem');
    root.style.setProperty('--rounded-btn', '0.5rem');
    root.style.setProperty('--rounded-badge', '2rem');
    root.style.setProperty('--animation-btn', '0.25s');
    root.style.setProperty('--animation-input', '0.2s');
    root.style.setProperty('--btn-focus-scale', '0.95');
    root.style.setProperty('--tab-radius', '0.5rem');
  },

  setModo: function (modo) {
    if (modo === 'oscuro') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    APP_CONFIG.tema.modo = modo;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  window.themeStore.aplicar();
});
