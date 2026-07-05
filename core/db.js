// db.js — Inicializaci\u00f3n Dexie para AHA Rx
'use strict';

window.db = new Dexie('AHA-Rx');

db.version(2).stores({
  pacientes: 'id, nombre, *telefono, direccion, *fechaNacimiento, alergias, createdAt, updatedAt',
  medicamentos: 'id, nombre, *presentacion, *laboratorio, createdAt, updatedAt',
  recetas: 'id, *pacienteId, *diagnostico, indicaciones, *proximaCita, *createdBy, createdAt, updatedAt',
  recetas_items: 'id, *recetaId, *medicamentoId, dosis, frecuencia, duracion',
  _sync_log: '++id, tipo, fecha, detalle',
  _ia_chats: '++id, titulo, createdAt, updatedAt',
  _ia_messages: '++id, chatId, rol, contenido, createdAt',
  _files: '&path, tipo, nombre, mime, size, hash, refCount, createdAt, updatedAt',
  _file_blobs: '&path',
  _config: '&clave'
});

db.version(1).stores({
  pacientes: 'id, nombre, *telefono, direccion, *fechaNacimiento, alergias, createdAt, updatedAt',
  medicamentos: 'id, nombre, *presentacion, *laboratorio, createdAt, updatedAt',
  recetas: 'id, *pacienteId, *diagnostico, indicaciones, *proximaCita, *createdBy, createdAt, updatedAt',
  recetas_items: 'id, *recetaId, *medicamentoId, dosis, frecuencia, duracion'
});

db.open().catch(function (err) {
  console.error('❌ Error al abrir DB:', err);
});
