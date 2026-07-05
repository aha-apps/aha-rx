// project.config.js — AHA Rx
var APP_CONFIG = {
  app: {
    id: 'aha-rx',
    nombre: 'AHA Rx',
    version: '1.0.0',
    tipo: 'Recetas',
    descripcion: 'Recetas m\u00e9dicas offline para consultorios',
    plan: 'lite'
  },
  perfil: 'lite',
  iaJutia: { perfil: false },
  modulosActivos: ['pacientes', 'medicamentos', 'recetas', 'historial', 'estadisticas'],
  tema: {
    modo: 'claro',
    colores: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#34d399',
      neutral: '#1f2937',
      'base-100': '#ffffff',
      'base-200': '#f3f4f6',
      'base-300': '#d1d5db',
      'base-content': '#1f2937',
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    tipografia: {
      familia: 'system-ui, sans-serif',
      escalado: '1.25'
    }
  },
  cifrado: {
    camposSensibles: ['diagnostico'],
    storageKey: 'aha-rx-crypto-key'
  },
  ui: {
    formsMode: 'modal',
    alerts: 'toast',
    confirmDelete: true,
    avatars: false,
    avatarDefault: 'data/defaults/avatar.svg'
  },
  data: {
    dir: 'data/',
    maxFileSize: 10 * 1024 * 1024,
    tipos: ['avatar', 'foto', 'doc', 'logo', 'backup'],
    avatars: { default: 'data/defaults/avatar.svg', size: 200, calidad: 0.8 }
  },
  sync: {
    primaryFormat: 'json',
    secondaryFormats: [],
    includeFiles: true,
    encrypt: true,
    maxExportSize: 50 * 1024 * 1024
  },
  modulos: {
    pacientes: { titulo: 'Pacientes', icono: 'bi bi-people', activo: true },
    medicamentos: { titulo: 'Medicamentos', icono: 'bi bi-capsule', activo: true },
    recetas: { titulo: 'Recetas', icono: 'bi bi-file-earmark-text', activo: true },
    historial: { titulo: 'Historial', icono: 'bi bi-clock-history', activo: true },
    estadisticas: { titulo: 'Estad\u00edsticas', icono: 'bi bi-bar-chart-line', activo: true }
  }
};
