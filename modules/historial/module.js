// module.js — Historial de recetas
'use strict';

var HistorialModulo = {
  id: 'historial',
  titulo: 'Historial',
  icono: 'bi bi-clock-history',
  items: [],
  pacientes: [],
  medicamentos: [],
  busqueda: '',

  init: function () {
    console.log('💡 [historial] Inicializado');
    this.cargarCatalogos();
    this.cargarDatos();
  },

  render: function () {},

  destroy: function () {
    this.items = [];
    this.pacientes = [];
    this.medicamentos = [];
  },

  cargarCatalogos: function () {
    var self = this;
    db.pacientes.orderBy('nombre').toArray().then(function (data) {
      self.pacientes = data;
    });
    db.medicamentos.orderBy('nombre').toArray().then(function (data) {
      self.medicamentos = data;
    });
  },

  cargarDatos: function (pacienteId) {
    var self = this;
    var query = db.recetas.orderBy('createdAt').reverse();

    if (pacienteId) {
      query = db.recetas.where('pacienteId').equals(pacienteId).reverse();
    }

    query.toArray().then(function (data) {
      self.items = data;
      // Cargar items de cada receta
      var itemPromises = data.map(function (r) {
        return db.recetas_items.where('recetaId').equals(r.id).toArray().then(function (items) {
          r._items = items;
        });
      });
      return Promise.all(itemPromises);
    }).catch(function (err) {
      UI.toast('Error al cargar historial: ' + err.message, 'error');
    });
  },

  get filtered() {
    var self = this;
    if (!this.busqueda) return this.items;
    var q = this.busqueda.toLowerCase();
    return this.items.filter(function (r) {
      var diag = cryptoHelpers.decrypt(r.diagnostico) || r.diagnostico || '';
      var p = self.pacientes.find(function (p) { return p.id === r.pacienteId; });
      var pName = p ? p.nombre.toLowerCase() : '';
      // Buscar tambi\u00e9n en items (medicamentos)
      var medText = '';
      if (r._items) {
        r._items.forEach(function (item) {
          var med = self.medicamentos.find(function (m) { return m.id === item.medicamentoId; });
          if (med) medText += med.nombre.toLowerCase() + ' ';
        });
      }
      return diag.toLowerCase().indexOf(q) !== -1 ||
             pName.indexOf(q) !== -1 ||
             medText.indexOf(q) !== -1;
    });
  },

  getNombrePaciente: function (id) {
    var p = this.pacientes.find(function (p) { return p.id === id; });
    return p ? p.nombre : '---';
  },

  getNombreMedicamento: function (id) {
    var m = this.medicamentos.find(function (m) { return m.id === id; });
    return m ? m.nombre + ' ' + m.presentacion : '---';
  },

  reimprimirPDF: function (receta) {
    // Delegar al m\u00f3dulo de recetas
    var recetasMod = window.MODULES['recetas'];
    if (recetasMod) {
      recetasMod.pacientes = this.pacientes;
      recetasMod.medicamentos = this.medicamentos;
      recetasMod.generarPDF(receta);
    } else {
      UI.toast('Error: M\u00f3dulo de recetas no disponible', 'error');
    }
  },

  eliminar: function (item) {
    var self = this;
    UI.confirm('Eliminar esta receta del historial?').then(function (ok) {
      if (!ok) return;
      db.recetas_items.where('recetaId').equals(item.id).delete().then(function () {
        return db.recetas.delete(item.id);
      }).then(function () {
        UI.toast('Receta eliminada del historial', 'success');
        self.cargarDatos();
      }).catch(function (err) {
        UI.toast('Error al eliminar: ' + err.message, 'error');
      });
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['historial'] = HistorialModulo;
