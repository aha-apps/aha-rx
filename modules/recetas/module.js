// module.js — Recetas con PDF
'use strict';

var RecetasModulo = {
  id: 'recetas',
  titulo: 'Recetas',
  icono: 'bi bi-file-earmark-text',
  items: [],
  pacientes: [],
  medicamentos: [],
  busqueda: '',

  init: function () {
    console.log('💡 [recetas] Inicializado');
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

  cargarDatos: function () {
    var self = this;
    db.recetas.orderBy('createdAt').reverse().toArray().then(function (data) {
      self.items = data;
    }).catch(function (err) {
      UI.toast('Error al cargar recetas: ' + err.message, 'error');
    });
  },

  get filtered() {
    var self = this;
    if (!this.busqueda) return this.items;
    var q = this.busqueda.toLowerCase();
    return this.items.filter(function (r) {
      var diag = r.diagnostico ? r.diagnostico.toLowerCase() : '';
      var p = self.pacientes.find(function (p) { return p.id === r.pacienteId; });
      var pName = p ? p.nombre.toLowerCase() : '';
      return diag.indexOf(q) !== -1 || pName.indexOf(q) !== -1;
    });
  },

  getNombrePaciente: function (id) {
    var p = this.pacientes.find(function (p) { return p.id === id; });
    return p ? p.nombre : '---';
  },

  abrirForm: function (item) {
    var editando = !!item;
    var titulo = editando ? 'Editar Receta' : 'Nueva Receta';

    var optionsPac = '<option value="">Seleccionar paciente...</option>';
    for (var i = 0; i < this.pacientes.length; i++) {
      var sel = (editando && item.pacienteId === this.pacientes[i].id) ? 'selected' : '';
      optionsPac += '<option value="' + this.pacientes[i].id + '" ' + sel + '>' + this.pacientes[i].nombre + '</option>';
    }

    var optionsMed = '<option value="">Seleccionar medicamento...</option>';
    for (var j = 0; j < this.medicamentos.length; j++) {
      optionsMed += '<option value="' + this.medicamentos[j].id + '">' + this.medicamentos[j].nombre + ' - ' + this.medicamentos[j].presentacion + '</option>';
    }

    var diagnostico = editando ? item.diagnostico : '';
    var indicaciones = editando ? item.indicaciones : '';
    var proximaCita = editando ? (item.proximaCita ? item.proximaCita.slice(0, 10) : '') : '';

    var html = '<div class="space-y-4">' +
      '<label class="form-control w-full"><span class="label-text">Paciente</span>' +
      '<select name="pacienteId" class="select select-bordered" required>' + optionsPac + '</select></label>' +
      '<label class="form-control w-full"><span class="label-text">Diagn\u00f3stico</span>' +
      '<input type="text" name="diagnostico" value="' + diagnostico.replace(/"/g, '&quot;') + '" class="input input-bordered" required /></label>' +
      '<label class="form-control w-full"><span class="label-text">Indicaciones generales</span>' +
      '<textarea name="indicaciones" class="textarea textarea-bordered" rows="2">' + indicaciones.replace(/"/g, '&quot;') + '</textarea></label>' +
      '<label class="form-control w-full"><span class="label-text">Pr\u00f3xima cita</span>' +
      '<input type="date" name="proximaCita" value="' + proximaCita + '" class="input input-bordered" /></label>' +
      '<div class="divider text-sm font-medium">Medicamentos recetados</div>' +
      '<div id="items-container" class="space-y-3">' +
      '<div class="receta-item grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-base-200 rounded-lg">' +
      '<select name="medicamentoId" class="select select-bordered select-sm">' + optionsMed + '</select>' +
      '<input type="text" name="dosis" placeholder="Dosis" class="input input-bordered input-sm" />' +
      '<input type="text" name="frecuencia" placeholder="Frecuencia" class="input input-bordered input-sm" />' +
      '<input type="text" name="duracion" placeholder="Duraci\u00f3n" class="input input-bordered input-sm" />' +
      '</div></div>' +
      '<button type="button" class="btn btn-sm btn-outline" onclick="RecetasModulo.agregarItemForm()"><i class="bi bi-plus-lg"></i> Agregar medicamento</button>' +
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

  agregarItemForm: function () {
    var container = document.getElementById('items-container');
    if (!container) return;
    var optionsMed = '<option value="">Seleccionar...</option>';
    for (var j = 0; j < this.medicamentos.length; j++) {
      optionsMed += '<option value="' + this.medicamentos[j].id + '">' + this.medicamentos[j].nombre + ' - ' + this.medicamentos[j].presentacion + '</option>';
    }
    var div = document.createElement('div');
    div.className = 'receta-item grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-base-200 rounded-lg';
    div.innerHTML = '<select name="medicamentoId" class="select select-bordered select-sm">' + optionsMed + '</select>' +
      '<input type="text" name="dosis" placeholder="Dosis" class="input input-bordered input-sm" />' +
      '<input type="text" name="frecuencia" placeholder="Frecuencia" class="input input-bordered input-sm" />' +
      '<input type="text" name="duracion" placeholder="Duraci\u00f3n" class="input input-bordered input-sm" />';
    container.appendChild(div);
  },

  guardar: function (datos) {
    var self = this;
    var recetaId = uuid();
    var diagnosticoCifrado = APP_CONFIG.cifrado.camposSensibles.indexOf('diagnostico') !== -1
      ? cryptoHelpers.encrypt(datos.diagnostico) : datos.diagnostico;

    var receta = {
      id: recetaId,
      pacienteId: datos.pacienteId,
      diagnostico: diagnosticoCifrado,
      indicaciones: datos.indicaciones || '',
      proximaCita: datos.proximaCita || '',
      createdBy: APP_CONFIG.usuarioActual || 'anon',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    var itemsContainer = document.getElementById('items-container');
    var itemDivs = itemsContainer ? itemsContainer.querySelectorAll('.receta-item') : [];
    var itemsPromises = [];

    for (var i = 0; i < itemDivs.length; i++) {
      var selects = itemDivs[i].querySelectorAll('select[name="medicamentoId"]');
      var inputs = itemDivs[i].querySelectorAll('input');
      if (selects.length > 0) {
        var medId = selects[0].value;
        if (medId) {
          var item = {
            id: uuid(),
            recetaId: recetaId,
            medicamentoId: medId,
            dosis: inputs.length > 0 ? inputs[0].value : '',
            frecuencia: inputs.length > 1 ? inputs[1].value : '',
            duracion: inputs.length > 2 ? inputs[2].value : ''
          };
          itemsPromises.push(db.recetas_items.put(item));
        }
      }
    }

    return db.recetas.put(receta).then(function () {
      return Promise.all(itemsPromises);
    }).then(function () {
      UI.toast('Receta guardada correctamente', 'success');
      self.cargarDatos();
      self.cargarCatalogos();
    });
  },

  actualizar: function (id, datos) {
    var self = this;
    var diagnosticoCifrado = APP_CONFIG.cifrado.camposSensibles.indexOf('diagnostico') !== -1
      ? cryptoHelpers.encrypt(datos.diagnostico) : datos.diagnostico;

    return db.recetas.get(id).then(function (existente) {
      if (!existente) { UI.toast('Receta no encontrada', 'error'); return; }
      var actualizado = {
        id: id,
        pacienteId: datos.pacienteId || existente.pacienteId,
        diagnostico: diagnosticoCifrado,
        indicaciones: datos.indicaciones || '',
        proximaCita: datos.proximaCita || '',
        createdBy: existente.createdBy,
        createdAt: existente.createdAt,
        updatedAt: new Date()
      };

      var itemsPromises = [];
      var itemsContainer = document.getElementById('items-container');
      var itemDivs = itemsContainer ? itemsContainer.querySelectorAll('.receta-item') : [];

      // Eliminar items anteriores
      itemsPromises.push(db.recetas_items.where('recetaId').equals(id).delete());

      for (var i = 0; i < itemDivs.length; i++) {
        var selects = itemDivs[i].querySelectorAll('select[name="medicamentoId"]');
        var inputs = itemDivs[i].querySelectorAll('input');
        if (selects.length > 0) {
          var medId = selects[0].value;
          if (medId) {
            var item = {
              id: uuid(),
              recetaId: id,
              medicamentoId: medId,
              dosis: inputs.length > 0 ? inputs[0].value : '',
              frecuencia: inputs.length > 1 ? inputs[1].value : '',
              duracion: inputs.length > 2 ? inputs[2].value : ''
            };
            itemsPromises.push(db.recetas_items.put(item));
          }
        }
      }

      return db.recetas.put(actualizado).then(function () {
        return Promise.all(itemsPromises);
      }).then(function () {
        UI.toast('Receta actualizada correctamente', 'success');
        self.cargarDatos();
      });
    });
  },

  eliminar: function (item) {
    var self = this;
    UI.confirm('Eliminar esta receta?').then(function (ok) {
      if (!ok) return;
      db.recetas_items.where('recetaId').equals(item.id).delete().then(function () {
        return db.recetas.delete(item.id);
      }).then(function () {
        UI.toast('Receta eliminada correctamente', 'success');
        self.cargarDatos();
      }).catch(function (err) {
        UI.toast('Error al eliminar: ' + err.message, 'error');
      });
    });
  },

  generarPDF: function (receta) {
    var self = this;
    var paciente = this.pacientes.find(function (p) { return p.id === receta.pacienteId; });

    db.recetas_items.where('recetaId').equals(receta.id).toArray().then(function (items) {
      // Obtener nombres de medicamentos
      var medicamentosMap = {};
      var medPromises = items.map(function (item) {
        return db.medicamentos.get(item.medicamentoId).then(function (med) {
          if (med) medicamentosMap[item.medicamentoId] = med;
        });
      });

      return Promise.all(medPromises).then(function () {
        // Crear PDF con jsPDF
        var doc = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'letter'
        });

        var pageW = 216;
        var marginLeft = 20;
        var marginRight = 20;
        var contentW = pageW - marginLeft - marginRight;
        var y = 25;
        var lineH = 7;

        // Funci\u00f3n para centrar texto
        function centerText(text, yPos, size) {
          doc.setFontSize(size || 14);
          var w = doc.getTextWidth(text);
          doc.text(text, (pageW - w) / 2, yPos);
        }

        // Encabezado m\u00e9dico
        doc.setFillColor(5, 150, 105);
        doc.rect(0, 0, pageW, 55, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        centerText('AHA Rx', 22, 28);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        centerText('Receta M\u00e9dica', 34, 12);
        centerText('Consultorio Particular', 44, 10);

        // L\u00ednea separadora
        y = 65;
        doc.setDrawColor(5, 150, 105);
        doc.setLineWidth(0.5);
        doc.line(marginLeft, y, pageW - marginRight, y);

        // Datos del paciente
        y += 10;
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Paciente:', marginLeft, y);
        doc.setFont('helvetica', 'normal');
        var nomPac = paciente ? paciente.nombre : '---';
        doc.text(nomPac, marginLeft + 30, y);

        // Edad / Fecha
        y += lineH;
        doc.setFont('helvetica', 'bold');
        doc.text('Fecha:', marginLeft, y);
        doc.setFont('helvetica', 'normal');
        doc.text(UI.formatDate(new Date()), marginLeft + 30, y);

        // Diagn\u00f3stico
        y += lineH + 3;
        doc.setDrawColor(200, 200, 200);
        doc.line(marginLeft, y - 2, pageW - marginRight, y - 2);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(5, 150, 105);
        doc.text('Diagn\u00f3stico:', marginLeft, y);
        y += lineH;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        var diag = cryptoHelpers.decrypt(receta.diagnostico) || receta.diagnostico || '---';
        doc.text(diag, marginLeft + 5, y);

        // S\u00edmbolo Rx
        y += 10;
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text('Rp/', marginLeft, y);

        // Medicamentos
        y += 3;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var med = medicamentosMap[item.medicamentoId];

          // Verificar salto de p\u00e1gina
          if (y > 250) {
            doc.addPage();
            y = 25;
          }

          y += lineH + 2;
          doc.setFont('helvetica', 'bold');
          var medName = med ? (med.nombre + ' ' + med.presentacion) : '---';
          doc.text((i + 1) + '. ' + medName, marginLeft + 5, y);

          y += lineH;
          doc.setFont('helvetica', 'normal');
          var dosis = item.dosis ? item.dosis : '';
          var frecuencia = item.frecuencia ? 'cada ' + item.frecuencia : '';
          var duracion = item.duracion ? 'por ' + item.duracion : '';
          var posologia = [];
          if (dosis) posologia.push(dosis);
          if (frecuencia) posologia.push(frecuencia);
          if (duracion) posologia.push(duracion);
          doc.setFontSize(9);
          doc.text(posologia.join(', '), marginLeft + 10, y);
          doc.setFontSize(10);
        }

        // Indicaciones
        if (receta.indicaciones) {
          y += 8;
          if (y > 250) {
            doc.addPage();
            y = 25;
          }
          doc.setDrawColor(200, 200, 200);
          doc.line(marginLeft, y - 3, pageW - marginRight, y - 3);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(5, 150, 105);
          doc.text('Indicaciones:', marginLeft, y);
          y += lineH;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(50, 50, 50);
          var lines = doc.splitTextToSize(receta.indicaciones, contentW - 10);
          doc.text(lines, marginLeft + 5, y);
          y += lines.length * lineH;
        }

        // Pr\u00f3xima cita
        y += 6;
        if (y > 260) {
          doc.addPage();
          y = 25;
        }
        if (receta.proximaCita) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(5, 150, 105);
          doc.text('Pr\u00f3xima cita: ' + UI.formatDate(receta.proximaCita), marginLeft, y);
          y += 10;
        }

        // Firma
        y = Math.max(y, 230);
        doc.setDrawColor(100, 100, 100);
        doc.line(marginLeft + 40, y, marginLeft + 100, y);
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text('Dr. ' + (APP_CONFIG.usuarioActual || 'M\u00e9dico'), marginLeft + 40, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text('C\u00e9dula Profesional', marginLeft + 40, y);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        var footerText = 'Receta generada por AHA Rx el ' + UI.formatDate(new Date());
        centerText(footerText, 275, 8);

        // Descargar PDF
        var pacienteFecha = (paciente ? paciente.nombre.replace(/\s+/g, '_') : 'paciente') + '_' + new Date().toISOString().slice(0, 10);
        doc.save('Receta_' + pacienteFecha + '.pdf');
        UI.toast('PDF generado correctamente', 'success');
      });
    }).catch(function (err) {
      UI.toast('Error al generar PDF: ' + err.message, 'error');
    });
  }
};

window.MODULES = window.MODULES || {};
window.MODULES['recetas'] = RecetasModulo;
