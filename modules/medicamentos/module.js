// module.js — Medicamentos
'use strict';

var MedicamentosModulo = {
  id: 'medicamentos',
  titulo: 'Medicamentos',
  icono: 'bi bi-capsule',
  items: [],
  busqueda: '',

  init: function () {
    console.log('💡 [medicamentos] Inicializado');
    this.cargarDatos();
  },

  render: function () {},

  destroy: function () {
    this.items = [];
  },

  cargarDatos: function () {
    var self = this;
    db.medicamentos.orderBy('nombre').toArray().then(function (data) {
      self.items = data;
    }).catch(function (err) {
      UI.toast('Error al cargar medicamentos: ' + err.message, 'error');
    });
  },

  get filtered() {
    var self = this;
    if (!this.busqueda) return this.items;
    var q = this.busqueda.toLowerCase();
    return this.items.filter(function (m) {
      return (m.nombre && m.nombre.toLowerCase().indexOf(q) !== -1) ||
             (m.presentacion && m.presentacion.toLowerCase().indexOf(q) !== -1) ||
             (m.laboratorio && m.laboratorio.toLowerCase().indexOf(q) !== -1);
    });
  },

  abrirForm: function (item) {
    var editando = !!item;
    var titulo = editando ? 'Editar Medicamento' : 'Nuevo Medicamento';

    var nombre = editando ? item.nombre : '';
    var presentacion = editando ? item.presentacion : '';
    var laboratorio = editando ? item.laboratorio : '';

    var html = '<div class="space-y-4">' +
      '<label class="form-control w-full"><span class="label-text">Nombre gen\u00e9rico</span>' +
      '<input type="text" name="nombre" value="' + nombre.replace(/"/g, '&quot;') + '" class="input input-bordered" required /></label>' +
      '<label class="form-control w-full"><span class="label-text">Presentaci\u00f3n</span>' +
      '<input type="text" name="presentacion" value="' + presentacion.replace(/"/g, '&quot;') + '" class="input input-bordered" placeholder="Ej: 500 mg tabletas" /></label>' +
      '<label class="form-control w-full"><span class="label-text">Laboratorio</span>' +
      '<input type="text" name="laboratorio" value="' + laboratorio.replace(/"/g, '&quot;') + '" class="input input-bordered" placeholder="Ej: Gen\u00e9rico" /></label>' +
      '</div>';

    var self = this;
    UI.modalForm(titulo, html, function (data) {
      if (editando) {
        return self.actualizar(item.id, data);
      } else {
        return self.guardar(data);
      }
    });
  },

  guardar: function (datos) {
    var registro = {
      id: uuid(),
      nombre: datos.nombre,
      presentacion: datos.presentacion || '',
      laboratorio: datos.laboratorio || '',
      createdBy: APP_CONFIG.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var self = this;
    return db.medicamentos.put(registro).then(function () {
      UI.toast('Medicamento guardado correctamente', 'success');
      self.cargarDatos();
    });
  },

  actualizar: function (id, datos) {
    var self = this;
    return db.medicamentos.get(id).then(function (existente) {
      if (!existente) { UI.toast('Medicamento no encontrado', 'error'); return; }
      var actualizado = {
        id: id,
        nombre: datos.nombre,
        presentacion: datos.presentacion || '',
        laboratorio: datos.laboratorio || '',
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.medicamentos.put(actualizado).then(function () {
        UI.toast('Medicamento actualizado correctamente', 'success');
        self.cargarDatos();
      });
    });
  },

  eliminar: function (item) {
    var self = this;
    UI.confirm('Eliminar ' + item.nombre + ' ' + item.presentacion + '?').then(function (ok) {
      if (!ok) return;
      db.medicamentos.delete(item.id).then(function () {
        UI.toast('Medicamento eliminado correctamente', 'success');
        self.cargarDatos();
      }).catch(function (err) {
        UI.toast('Error al eliminar: ' + err.message, 'error');
      });
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['medicamentos'] = MedicamentosModulo;
