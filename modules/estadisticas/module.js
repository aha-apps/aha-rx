// module.js — Estad\u00edsticas y Dashboard
'use strict';

var EstadisticasModulo = {
  id: 'estadisticas',
  titulo: 'Estad\u00edsticas',
  icono: 'bi bi-bar-chart-line',
  chartInstance: null,
  totalPacientes: 0,
  totalMedicamentos: 0,
  totalRecetas: 0,
  recetasHoy: 0,
  diagnosticosFrecuentes: [],

  init: function () {
    console.log('💡 [estadisticas] Inicializado');
    this.cargarEstadisticas();
  },

  render: function () {},

  destroy: function () {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },

  cargarEstadisticas: function () {
    var self = this;

    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    Promise.all([
      db.pacientes.count(),
      db.medicamentos.count(),
      db.recetas.count(),
      db.recetas.toArray()
    ]).then(function (results) {
      self.totalPacientes = results[0];
      self.totalMedicamentos = results[1];
      self.totalRecetas = results[2];
      var todasRecetas = results[3];

      // Recetas de hoy
      var hoyStr = hoy.toISOString();
      self.recetasHoy = 0;
      for (var i = 0; i < todasRecetas.length; i++) {
        var r = todasRecetas[i];
        if (r.createdAt) {
          var rDate = new Date(r.createdAt);
          if (rDate >= hoy) {
            self.recetasHoy++;
          }
        }
      }

      // Diagn\u00f3sticos m\u00e1s frecuentes
      var diagCount = {};
      for (var j = 0; j < todasRecetas.length; j++) {
        var diag = todasRecetas[j].diagnostico;
        if (diag) {
          // Descifrar si es necesario
          if (typeof diag === 'string' && diag.indexOf('U2FsdGVkX1') === 0) {
            diag = cryptoHelpers.decrypt(diag) || diag;
          }
          if (diag) {
            diagCount[diag] = (diagCount[diag] || 0) + 1;
          }
        }
      }

      // Ordenar y tomar top 10
      var sorted = [];
      for (var key in diagCount) {
        if (diagCount.hasOwnProperty(key)) {
          sorted.push({ diagnostico: key, count: diagCount[key] });
        }
      }
      sorted.sort(function (a, b) { return b.count - a.count; });
      self.diagnosticosFrecuentes = sorted.slice(0, 10);

      // Renderizar gr\u00e1fica
      self.renderChart();
    }).catch(function (err) {
      UI.toast('Error al cargar estad\u00edsticas: ' + err.message, 'error');
    });
  },

  renderChart: function () {
    var canvas = document.getElementById('chart-diagnosticos');
    if (!canvas) {
      // Esperar a que el DOM est\u00e9 listo
      var self = this;
      setTimeout(function () { self.renderChart(); }, 300);
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    var ctx = canvas.getContext('2d');
    var labels = [];
    var data = [];

    for (var i = 0; i < this.diagnosticosFrecuentes.length; i++) {
      var d = this.diagnosticosFrecuentes[i];
      labels.push(d.diagnostico.length > 25 ? d.diagnostico.substring(0, 25) + '...' : d.diagnostico);
      data.push(d.count);
    }

    if (labels.length === 0) {
      labels = ['Sin datos'];
      data = [0];
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Recetas',
          data: data,
          backgroundColor: 'rgba(5, 150, 105, 0.7)',
          borderColor: 'rgba(5, 150, 105, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleFont: { size: 12 },
            bodyFont: { size: 11 },
            cornerRadius: 8,
            padding: 10
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0,0,0,0.06)'
            }
          },
          x: {
            ticks: {
              font: { size: 9 },
              maxRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  },

  exportCSV: function () {
    var self = this;
    UI.loading(true);

    Promise.all([
      db.pacientes.toArray(),
      db.medicamentos.toArray(),
      db.recetas.toArray(),
      db.recetas_items.toArray()
    ]).then(function (results) {
      var pacientes = results[0];
      var medicamentos = results[1];
      var recetas = results[2];
      var items = results[3];

      var lines = [];
      lines.push('AHA Rx - Exportaci\u00f3n de datos');
      lines.push('Exportado: ' + new Date().toISOString());
      lines.push('');

      // ===== Pacientes =====
      lines.push('=== PACIENTES ===');
      lines.push('ID,Nombre,Tel\u00e9fono,Direcci\u00f3n,Fecha Nacimiento,Alergias,Creado,Actualizado');
      for (var i = 0; i < pacientes.length; i++) {
        var p = pacientes[i];
        lines.push([
          p.id,
          CSVescape(p.nombre),
          CSVescape(p.telefono),
          CSVescape(p.direccion),
          p.fechaNacimiento || '',
          CSVescape(p.alergias),
          p.createdAt || '',
          p.updatedAt || ''
        ].join(','));
      }
      lines.push('');

      // ===== Medicamentos =====
      lines.push('=== MEDICAMENTOS ===');
      lines.push('ID,Nombre,Presentaci\u00f3n,Laboratorio,Creado,Actualizado');
      for (var j = 0; j < medicamentos.length; j++) {
        var m = medicamentos[j];
        lines.push([
          m.id,
          CSVescape(m.nombre),
          CSVescape(m.presentacion),
          CSVescape(m.laboratorio),
          m.createdAt || '',
          m.updatedAt || ''
        ].join(','));
      }
      lines.push('');

      // ===== Recetas =====
      lines.push('=== RECETAS ===');
      lines.push('ID,Paciente ID,Paciente Nombre,Diagn\u00f3stico,Indicaciones,Pr\u00f3xima Cita,Creado,Actualizado');
      for (var k = 0; k < recetas.length; k++) {
        var r = recetas[k];
        var pac = pacientes.find(function (p) { return p.id === r.pacienteId; });
        var pacName = pac ? pac.nombre : '---';
        var diag = r.diagnostico;
        if (typeof diag === 'string' && diag.indexOf('U2FsdGVkX1') === 0) {
          diag = cryptoHelpers.decrypt(diag) || diag;
        }
        lines.push([
          r.id,
          r.pacienteId || '',
          CSVescape(pacName),
          CSVescape(diag),
          CSVescape(r.indicaciones),
          r.proximaCita || '',
          r.createdAt || '',
          r.updatedAt || ''
        ].join(','));
      }
      lines.push('');

      // ===== Items Receta =====
      lines.push('=== ITEMS RECETA ===');
      lines.push('ID,Receta ID,Medicamento ID,Medicamento Nombre,Dosis,Frecuencia,Duraci\u00f3n');
      for (var l = 0; l < items.length; l++) {
        var it = items[l];
        var med = medicamentos.find(function (m) { return m.id === it.medicamentoId; });
        var medName = med ? (med.nombre + ' ' + med.presentacion) : '---';
        lines.push([
          it.id,
          it.recetaId || '',
          it.medicamentoId || '',
          CSVescape(medName),
          CSVescape(it.dosis),
          CSVescape(it.frecuencia),
          CSVescape(it.duracion)
        ].join(','));
      }

      var csv = lines.join('\r\n');
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'AHA-Rx_export_' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      UI.loading(false);
      UI.toast('CSV exportado correctamente', 'success');
    }).catch(function (err) {
      UI.loading(false);
      UI.toast('Error al exportar CSV: ' + err.message, 'error');
    });
  }
};

// Helper CSV
function CSVescape(str) {
  if (!str) return '';
  var s = String(str);
  if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

window.MODULES = window.MODULES || {};
window.MODULES['estadisticas'] = EstadisticasModulo;
