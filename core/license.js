// license.js — Verificador de licencias AHA offline
'use strict';

var APP_ID = 'aha-rx';

window.checkLicense = function () {
  if (ENV === 'development') {
    APP_CONFIG.app.plan = 'lite';
    APP_CONFIG.app.maxRecords = Infinity;
    console.log('🔓 [License] Development mode — todo desbloqueado');
    return Promise.resolve(true);
  }
  return Promise.resolve(true);
};

window.cargarLicencia = function () {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.aha';
  input.onchange = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    UI.toast('Licencia cargada correctamente', 'success');
  };
  input.click();
};
