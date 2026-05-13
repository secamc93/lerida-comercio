# .claude/

Configuración local de Claude Code para este proyecto.

- `settings.json` — permisos preautorizados para comandos comunes (make, go,
  pnpm, docker compose, git read-only, curl) y otras configuraciones del
  cliente.

Las instrucciones de comportamiento (qué hacer, qué no hacer, dónde buscar
contexto) viven en `CLAUDE.md` en la raíz del repo. El contexto del proyecto
en `context/`.

## Carpetas opcionales que puedes agregar después

- `agents/` — subagentes personalizados (`*.md` con frontmatter).
- `commands/` — slash commands del proyecto (`*.md`).
- `settings.local.json` — overrides locales (no se commitea — está en
  `.gitignore`).
