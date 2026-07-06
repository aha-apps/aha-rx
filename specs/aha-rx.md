# AHA Rx — Especificación Funcional

## Identidad

- **Nombre:** AHA Rx
- **Tagline:** Recetario médico digital offline
- **Perfil:** Lite (file://, doble clic)
- **Stack:** Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- **Tema:** #059669 (emerald-600)
- **Branch:** main

## Propósito

Aplicación offline-first para la emisión y gestión de recetas médicas. Permite registrar pacientes y doctores, mantener un catálogo de medicamentos y generar recetas con múltiples items.

## DB Schema (Dexie)

```
pacientes: ++id, nombre, *telefono, *email, *fechaNacimiento, *alergias, *createdBy, createdAt, updatedAt
doctores: ++id, nombre, *cedula, *especialidad, *telefono, *email, *createdBy, createdAt, updatedAt
medicamentos: ++id, nombre, *presentacion, *dosis, *principioActivo, createdAt
recetas: ++id, *pacienteId, *doctorId, *fecha, *diagnostico, *indicaciones, *createdBy, createdAt, updatedAt
items_receta: ++id, *recetaId, *medicamentoId, dosis, *frecuencia, *duracion, *notas, createdAt
```

### Indexes adicionales

- pacientes: `&telefono` (unique)
- doctores: `&cedula` (unique)
- medicamentos: `&nombre` (unique), `&principioActivo`
- recetas: `*fecha`
- items_receta: `*recetaId`

## Módulos

### 1. Pacientes (`#/pacientes`)
- Lista con búsqueda por nombre, teléfono
- CRUD completo
- Campos: nombre (requerido), teléfono (único), email, fecha de nacimiento, alergias
- Historial de recetas del paciente

### 2. Recetas (`#/recetas`)
- Crear receta: seleccionar paciente + doctor + diagnóstico
- Agregar items de medicamento con dosis, frecuencia, duración
- Vista de receta completa imprimible
- Estados: activa, completada, cancelada
- Editar solo si está activa

### 3. Medicamentos (`#/medicamentos`)
- Catálogo con nombre, presentación, dosis, principio activo
- CRUD completo
- Búsqueda por nombre o principio activo
- Seed data con medicamentos comunes

### 4. Doctor (`#/doctor`)
- Perfil del doctor que emite las recetas
- Campos: nombre, cédula (única), especialidad, teléfono, email
- Un solo doctor activo por instalación

### 5. Reportes (`#/reportes`)
- Recetas por período (barras)
- Pacientes más frecuentes (top 10)
- Medicamentos más recetados (pastel)
- Distribución por especialidad (dona)

## Reglas de Negocio

- Una receta siempre tiene al menos un item de medicamento
- No se puede eliminar un paciente con recetas activas
- La cédula del doctor debe ser única
- Al completar una receta, no se puede modificar
- Recetas mayores a 30 días se marcan como vencidas
