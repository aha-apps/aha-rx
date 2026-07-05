# AHA Rx — Recetas M\u00e9dicas Offline

Aplicaci\u00f3n offline-first para consultorios m\u00e9dicos. Registro de pacientes, cat\u00e1logo de medicamentos, generaci\u00f3n de recetas PDF con formato m\u00e9dico profesional, historial cl\u00ednico y estad\u00edsticas.

## Caracter\u00edsticas

- **Pacientes:** CRUD completo con datos de contacto y alergias
- **Medicamentos:** Cat\u00e1logo con 40+ medicamentos precargados
- **Recetas:** Creaci\u00f3n con diagn\u00f3stico, medicamentos (dosis/frecuencia/duraci\u00f3n), indicaciones y pr\u00f3xima cita
- **PDF M\u00e9dico:** Generaci\u00f3n de recetas con formato profesional (jsPDF)
- **Historial:** Vista cronol\u00f3gica con b\u00fasqueda avanzada y reimpresi\u00f3n
- **Estad\u00edsticas:** Dashboard con KPIs y gr\u00e1fico de diagn\u00f3sticos frecuentes (Chart.js)
- **Exportaci\u00f3n:** CSV completo de todas las tablas
- **Backup:** Export/import cifrado (.ateje-backup)
- **100% offline:** Sin conexi\u00f3n a internet requerida

## Stack T\u00e9cnico

- **Alpine.js 3** — Reactividad
- **Dexie.js 3** — IndexedDB offline
- **DaisyUI 4 + Tailwind CSS** — UI
- **Bootstrap Icons** — Iconograf\u00eda
- **CryptoJS** — Cifrado AES de datos sensibles
- **Chart.js** — Gr\u00e1ficos
- **jsPDF** — PDF
- **pako** — Compresi\u00f3n backups

## Uso

Simplemente abre `index.html` en cualquier navegador moderno.

### Seed Data
Usa el bot\u00f3n "Cargar cat\u00e1logo" en Medicamentos para poblar la base de datos con 40+ medicamentos de ejemplo.

## Estructura

```
aha-rx/
  index.html          — Shell principal
  project.config.js   — Configuraci\u00f3n
  manifest.json       — PWA manifest
  sw.js               — Service Worker
  seed.js             — Datos de ejemplo
  core/               — 13 archivos de sistema
  modules/            — 5 m\u00f3dulos (10 archivos)
  assets/             — Librer\u00edas e icons
  data/               — Defaults
```

## Perfil

Lite (Essential) — HTML visible, ZIP + GitHub Pages
