// module.js — Pacientes
'use strict';

var PacientesModulo = {
  id: 'pacientes',
  titulo: 'Pacientes',
  icono: 'bi bi-people',
  items: [],
  busqueda: '',

  init: function () {
    console.log('💡 [pacientes] Inicializado');
    this.cargarDatos();
  },

  render: function () {
    // Ya lo hace el HTML con Alpine
  },

  destroy: function () {
    this.items = [];
  },

  cargarDatos: function () {
    var self = this;
    UI.loading(true);
    db.pacientes.orderBy('nombre').toArray().then(function (data) {
      self.items = data;
      UI.loading(false);
    }).catch(function (err) {
      UI.loading(false);
      UI.toast('Error al cargar pacientes: ' + err.message, 'error');
    });
  },

  get filtered() {
    var self = this;
    if (!this.busqueda) return this.items;
    var q = this.busqueda.toLowerCase();
    return this.items.filter(function (p) {
      return (p.nombre && p.nombre.toLowerCase().indexOf(q) !== -1) ||
             (p.telefono && p.telefono.indexOf(q) !== -1);
    });
  },

  abrirForm: function (item) {
    var editando = !!item;
    var titulo = editando ? 'Editar Paciente' : 'Nuevo Paciente';

    var nombre = editando ? item.nombre : '';
    var telefono = editando ? item.telefono : '';
    var direccion = editando ? item.direccion : '';
    var fechaNacimiento = editando ? (item.fechaNacimiento ? item.fechaNacimiento.slice(0,10) : '') : '';
    var alergias = editando ? item.alergias : '';

    var html = '<div class="space-y-4">' +
      '<label class="form-control w-full"><span class="label-text">Nombre completo</span>' +
      '<input type="text" name="nombre" value="' + nombre.replace(/"/g, '&quot;') + '" class="input input-bordered" required /></label>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' +
      '<label class="form-control w-full"><span class="label-text">Tel\u00e9fono</span>' +
      '<input type="tel" name="telefono" value="' + telefono.replace(/"/g, '&quot;') + '" class="input input-bordered" /></label>' +
      '<label class="form-control w-full"><span class="label-text">Fecha de nacimiento</span>' +
      '<input type="date" name="fechaNacimiento" value="' + fechaNacimiento + '" class="input input-bordered" /></label>' +
      '</div>' +
      '<label class="form-control w-full"><span class="label-text">Direcci\u00f3n</span>' +
      '<input type="text" name="direccion" value="' + direccion.replace(/"/g, '&quot;') + '" class="input input-bordered" /></label>' +
      '<label class="form-control w-full"><span class="label-text">Alergias</span>' +
      '<textarea name="alergias" class="textarea textarea-bordered" rows="2">' + alergias.replace(/"/g, '&quot;') + '</textarea></label>' +
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
      telefono: datos.telefono || '',
      direccion: datos.direccion || '',
      fechaNacimiento: datos.fechaNacimiento || '',
      alergias: datos.alergias || '',
      createdBy: APP_CONFIG.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var self = this;
    return db.pacientes.put(registro).then(function () {
      UI.toast('Paciente guardado correctamente', 'success');
      self.cargarDatos();
    });
  },

  actualizar: function (id, datos) {
    var self = this;
    return db.pacientes.get(id).then(function (existente) {
      if (!existente) { UI.toast('Paciente no encontrado', 'error'); return; }
      var actualizado = {
        id: id,
        nombre: datos.nombre,
        telefono: datos.telefono || '',
        direccion: datos.direccion || '',
        fechaNacimiento: datos.fechaNacimiento || '',
        alergias: datos.alergias || '',
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };
      return db.pacientes.put(actualizado).then(function () {
        UI.toast('Paciente actualizado correctamente', 'success');
        self.cargarDatos();
      });
    });
  },

  eliminar: function (item) {
    var self = this;
    UI.confirm('Eliminar a ' + item.nombre + '? Se eliminar\u00e1n tambi\u00e9n sus recetas.').then(function (ok) {
      if (!ok) return;
      // Eliminar recetas del paciente y sus items
      db.recetas.where('pacienteId').equals(item.id).toArray().then(function (recetas) {
        var ids = recetas.map(function (r) { return r.id; });
        var promises = [];
        ids.forEach(function (rid) {
          promises.push(db.recetas_items.where('recetaId').equals(rid).delete());
        });
        promises.push(db.recetas.where('pacienteId').equals(item.id).delete());
        promises.push(db.pacientes.delete(item.id));
        return Promise.all(promises);
      }).then(function () {
        UI.toast('Paciente eliminado correctamente', 'success');
        self.cargarDatos();
      }).catch(function (err) {
        UI.toast('Error al eliminar: ' + err.message, 'error');
      });
    });
  },

  verHistorial: function (pacienteId) {
    window.appRouter.navigate('historial', { pacienteId: pacienteId });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['pacientes'] = PacientesModulo;
