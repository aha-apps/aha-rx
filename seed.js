// seed.js — Cat\u00e1logo de medicamentos de ejemplo
'use strict';

window.SeedData = {
  medicamentos: [
    { nombre: 'Paracetamol', presentacion: '500 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Paracetamol', presentacion: '1 g tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Ibuprofeno', presentacion: '400 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Ibuprofeno', presentacion: '600 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Amoxicilina', presentacion: '500 mg c\u00e1psulas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Amoxicilina', presentacion: '250 mg/5ml suspensi\u00f3n', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Amoxicilina + \u00c1cido Clavul\u00e1nico', presentacion: '875/125 mg tabletas', laboratorio: 'GlaxoSmithKline' },
    { nombre: 'Azitromicina', presentacion: '500 mg tabletas', laboratorio: 'Pfizer' },
    { nombre: 'Azitromicina', presentacion: '200 mg/5ml suspensi\u00f3n', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Diclofenaco', presentacion: '50 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Diclofenaco', presentacion: '100 mg \u00f3vulos', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Naproxeno', presentacion: '500 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Omeprazol', presentacion: '20 mg c\u00e1psulas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Losart\u00e1n', presentacion: '50 mg tabletas', laboratorio: 'Merck' },
    { nombre: 'Enalapril', presentacion: '10 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Metformina', presentacion: '850 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Metformina', presentacion: '500 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Salbutamol', presentacion: '100 mcg inhalador', laboratorio: 'GlaxoSmithKline' },
    { nombre: 'Loratadina', presentacion: '10 mg tabletas', laboratorio: 'Bayer' },
    { nombre: 'Cetirizina', presentacion: '10 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Dexametasona', presentacion: '8 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Prednisona', presentacion: '50 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Hidroclorotiazida', presentacion: '25 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Furosemida', presentacion: '40 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Ranitidina', presentacion: '150 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Vitamina C', presentacion: '1 g efervescente', laboratorio: 'Bayer' },
    { nombre: 'Complejo B', presentacion: 'tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Hierro Sulfato', presentacion: '200 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: '\u00c1cido F\u00f3lico', presentacion: '5 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Clindamicina', presentacion: '300 mg c\u00e1psulas', laboratorio: 'Pfizer' },
    { nombre: 'Ciprofloxacino', presentacion: '500 mg tabletas', laboratorio: 'Bayer' },
    { nombre: 'Trimetoprima/Sulfametoxazol', presentacion: '160/800 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Fluconazol', presentacion: '150 mg c\u00e1psulas', laboratorio: 'Pfizer' },
    { nombre: 'Metronidazol', presentacion: '500 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Diazepam', presentacion: '10 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Clonazepam', presentacion: '2 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Tramadol', presentacion: '50 mg c\u00e1psulas', laboratorio: 'Gr\u00fcnenthal' },
    { nombre: 'Ketorolaco', presentacion: '10 mg tabletas', laboratorio: 'Gen\u00e9rico' },
    { nombre: 'Hioscina', presentacion: '10 mg tabletas', laboratorio: 'Boehringer' },
    { nombre: 'Bismuto Subsalicilato', presentacion: '262 mg tabletas', laboratorio: 'Gen\u00e9rico' }
  ],

  sembrar: function () {
    var self = this;
    UI.toast('Sembrando datos de ejemplo...', 'info');

    // Revisar si ya hay medicamentos
    db.medicamentos.count().then(function (count) {
      if (count > 0) {
        UI.toast('Ya hay ' + count + ' medicamentos en la base de datos', 'info');
        return;
      }

      var records = self.medicamentos.map(function (m) {
        return {
          id: uuid(),
          nombre: m.nombre,
          presentacion: m.presentacion,
          laboratorio: m.laboratorio,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      db.medicamentos.bulkAdd(records).then(function () {
        UI.toast(records.length + ' medicamentos de ejemplo cargados', 'success');
      }).catch(function (err) {
        UI.toast('Error al sembrar medicamentos: ' + err.message, 'error');
      });
    });
  }
};
