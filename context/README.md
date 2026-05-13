# context/

Contexto persistente del proyecto para Claude Code y para humanos que
necesiten contexto rápido.

```
context/
├── project/   # Estado vigente: arquitectura, modelos, endpoints, puertos
├── tasks/     # Tareas en curso, backlog, decisiones técnicas
└── tests/     # Especificaciones y planes de testing
```

## Reglas

- Archivos cortos y útiles. Hechos verificables, no narrativa.
- Si algo se puede derivar del código (lista de funciones, rutas de un
  archivo, etc.), no lo dupliques aquí. Documenta solo lo no obvio.
- Una decisión técnica importante merece su propio `.md` con la fecha
  en el nombre: `2026-05-15-titulo-corto.md`.
- Cuando una tarea se completa y queda reflejada en el código, mueve el
  archivo a un subdirectorio `done/` o elimínalo. Mantén `context/`
  limpio de cosas obsoletas.

## Cómo usar cada carpeta

### `project/`
Estado **actual** del proyecto. Hay un `overview.md` que se actualiza
cuando cambia algo de la arquitectura. Si agregas un servicio, un módulo
grande, o cambias el stack: actualiza ahí.

### `tasks/`
Trabajo en curso o pendiente. Útil para retomar después de varios días.
Si dejas una tarea a medias, deja un `.md` aquí con:
- Qué estaba haciendo
- Por qué
- Qué falta
- Bloqueadores si hay

### `tests/`
Planes de testing por módulo, casos edge identificados, cobertura.
No es para guardar los tests en sí (esos van en el código), sino para
documentar **qué probar** y **por qué**.
