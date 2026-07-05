// ui.js — API de interfaz de usuario para AHA Rx
'use strict';

window.UI = {
  toast: function (msg, tipo, duracion) {
    if (tipo === undefined) tipo = 'info';
    if (duracion === undefined) duracion = 4000;

    var colores = {
      success: 'alert-success',
      error: 'alert-error',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    var iconos = {
      success: 'bi-check-circle-fill',
      error: 'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };

    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast toast-top toast-end z-[100]';
      document.body.appendChild(container);
    }

    var el = document.createElement('div');
    el.className = 'alert ' + (colores[tipo] || 'alert-info') + ' shadow-lg mb-2 animate__animated animate__fadeInRight';
    el.innerHTML = '<div class="flex items-center gap-2"><i class="bi ' + (iconos[tipo] || iconos.info) + ' text-lg"></i><span>' + msg + '</span></div>';
    container.appendChild(el);

    setTimeout(function () {
      el.classList.remove('animate__fadeInRight');
      el.classList.add('animate__fadeOutRight');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 500);
    }, duracion);
  },

  confirm: function (msg, titulo) {
    if (titulo === undefined) titulo = 'Confirmar';

    return new Promise(function (resolve) {
      var bg = document.createElement('div');
      bg.className = 'fixed inset-0 bg-base-300/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn';

      var modal = document.createElement('div');
      modal.className = 'modal-box max-w-sm';
      modal.innerHTML = '<h3 class="font-bold text-lg mb-2">' + titulo + '</h3><p class="py-2">' + msg + '</p><div class="modal-action flex gap-2"><button class="btn btn-ghost cancel-btn">Cancelar</button><button class="btn btn-primary confirm-btn">Confirmar</button></div>';

      bg.appendChild(modal);
      document.body.appendChild(bg);

      var cerrar = function (resultado) {
        bg.classList.remove('animate__fadeIn');
        bg.classList.add('animate__fadeOut');
        setTimeout(function () {
          if (bg.parentNode) bg.parentNode.removeChild(bg);
          resolve(resultado);
        }, 200);
      };

      modal.querySelector('.confirm-btn').addEventListener('click', function () { cerrar(true); });
      modal.querySelector('.cancel-btn').addEventListener('click', function () { cerrar(false); });
      bg.addEventListener('click', function (e) {
        if (e.target === bg) cerrar(false);
      });
    });
  },

  modalForm: function (titulo, html, onSave) {
    var bg = document.createElement('div');
    bg.className = 'fixed inset-0 bg-base-300/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate__animated animate__fadeIn';

    var modal = document.createElement('div');
    modal.className = 'modal-box max-w-2xl max-h-[90vh] overflow-y-auto';
    modal.innerHTML = '<h3 class="font-bold text-lg mb-4">' + titulo + '</h3><form class="space-y-4" id="modal-form">' + html + '</form><div class="modal-action flex gap-2"><button class="btn btn-ghost cancel-btn">Cancelar</button><button class="btn btn-primary save-btn" id="modal-save-btn">Guardar</button></div>';

    bg.appendChild(modal);
    document.body.appendChild(bg);

    var form = modal.querySelector('#modal-form');
    var saveBtn = modal.querySelector('#modal-save-btn');
    var inputs = form.querySelectorAll('[x-model]');

    inputs.forEach(function (input) {
      var field = input.getAttribute('x-model');
      var val = input.value;
      input.addEventListener('input', function () {
        val = input.value;
      });
      input._getVal = function () { return input.value; };
    });

    var recogerDatos = function () {
      var data = {};
      form.querySelectorAll('[name]').forEach(function (el) {
        data[el.getAttribute('name')] = el.value;
      });
      return data;
    };

    var cerrar = function () {
      bg.classList.remove('animate__fadeIn');
      bg.classList.add('animate__fadeOut');
      setTimeout(function () {
        if (bg.parentNode) bg.parentNode.removeChild(bg);
      }, 200);
    };

    modal.querySelector('.cancel-btn').addEventListener('click', cerrar);
    bg.addEventListener('click', function (e) {
      if (e.target === bg) cerrar();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Guardando...';
      var datos = recogerDatos();
      var promesa = onSave(datos);
      if (promesa && typeof promesa.then === 'function') {
        promesa.then(function () {
          cerrar();
        }).catch(function (err) {
          UI.toast(err.message || 'Error al guardar', 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = 'Guardar';
        });
      } else {
        cerrar();
      }
    });
  },

  loading: function (show) {
    var el = document.getElementById('loading-overlay');
    if (show) {
      if (!el) {
        el = document.createElement('div');
        el.id = 'loading-overlay';
        el.className = 'fixed inset-0 bg-base-300/50 backdrop-blur-sm z-[60] flex items-center justify-center';
        el.innerHTML = '<div class="flex flex-col items-center gap-3"><span class="loading loading-spinner loading-lg text-primary"></span><p class="text-sm text-base-content/60">Cargando...</p></div>';
        document.body.appendChild(el);
      }
      el.classList.remove('hidden');
    } else {
      if (el) el.classList.add('hidden');
    }
  },

  formatDate: function (date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return d.getDate() + ' ' + meses[d.getMonth()] + ' ' + d.getFullYear();
  },

  formatCurrency: function (n) {
    if (n === undefined || n === null) return '$0.00';
    return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatBytes: function (bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  formatRelative: function (date) {
    if (!date) return '';
    var d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    var ahora = new Date();
    var diff = Math.floor((ahora - d) / 1000);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return 'hace ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'hace ' + Math.floor(diff / 3600) + ' h';
    if (diff < 604800) return 'hace ' + Math.floor(diff / 86400) + ' d\u00edas';
    return this.formatDate(d);
  }
};
