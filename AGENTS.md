# AHA Rx — Stack Ateje (Lite)

## Identidad
- **Nombre:** AHA Rx
- **Tagline:** Recetario médico digital offline
- **Perfil:** Lite (file://, doble clic)
- **Stack:** Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- **Tema:** #059669
- **Módulos:** pacientes, recetas, medicamentos, doctor, reportes
- **Repo:** github.com/aha-apps/aha-rx

## Stack Técnico

- **Runtime:** Sin servidor. Abrir `index.html` con doble clic o servir con cualquier HTTP server
- **Frontend:** Alpine.js 3.14 (x-data, x-init, x-show, x-for, x-model, x-on, x-text, x-html, x-bind)
- **CSS:** DaisyUI 4 sobre Tailwind Play CDN (sin build step). Tema inyectado vía CSS variables
- **Iconos:** Bootstrap Icons v1.11
- **Persistencia:** Dexie 3 (IndexedDB) — offline-first, sin backend
- **Animaciones:** Animate.css v4
- **Cifrado:** CryptoJS AES (core/crypto.js)
- **Gráficos:** Chart.js 4
- **Compresión:** Pako 2 (para export/import .ateje-backup)
- **PWA:** Service Worker + manifest.json (instalable offline)

## Convenciones de Código (OBLIGATORIAS)

- **ES5 estricto:** `'use strict'`, `var`, function expressions. NO usar `import`, `export`, `type="module"`
- **CDNs en index.html:** Las librerías se cargan desde `assets/js/libs/` y `assets/css/`
- **UUID v4:** Usar `window.uuid()` de `core/crypto.js`
- **UI Helpers:** `UI.toast()`, `UI.confirm()`, `UI.modalForm()`, `UI.loading()`
- **DB:** `window.db` — instancia Dexie en core/db.js
- **Router:** Hash-based (core/app.js). Módulos se cargan por `#/modulo`
- **Módulos:** `module.html` (template Alpine) + `module.js` (lógica IIFE)
- **Sin `alert()`** — usar `UI.toast()` o `UI.confirm()`
- **Antes de `db.delete()`:** siempre `UI.confirm()`

## DB Schema

```
pacientes: ++id, nombre, *telefono, *email, *fechaNacimiento, *alergias, *createdBy, createdAt, updatedAt
doctores: ++id, nombre, *cedula, *especialidad, *telefono, *email, *createdBy, createdAt, updatedAt
medicamentos: ++id, nombre, *presentacion, *dosis, *principioActivo, createdAt
recetas: ++id, *pacienteId, *doctorId, *fecha, *diagnostico, *indicaciones, *createdBy, createdAt, updatedAt
items_receta: ++id, *recetaId, *medicamentoId, dosis, *frecuencia, *duracion, *notas, createdAt
```

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Pacientes | `#/pacientes` | CRUD de pacientes con datos médicos |
| Recetas | `#/recetas` | Creación y gestión de recetas médicas |
| Medicamentos | `#/medicamentos` | Catálogo de medicamentos |
| Doctor | `#/doctor` | Perfil del doctor y datos profesionales |
| Reportes | `#/reportes` | Estadísticas de recetas y pacientes |

## Cómo Trabajar

1. **Abrir:** Doble clic en `index.html`
2. **Reset:** DevTools > Application > IndexedDB > Eliminar
3. **Export:** Ajustes > Exportar (.ateje-backup)
4. **Debug:** `window.Alpine` en consola
