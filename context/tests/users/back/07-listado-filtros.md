# 07 — GET /users — paginación y filtros

**Módulo:** users   **Tipo:** back   **Estado:** ⏳ Pendiente ejecución completa

## Objetivo
Validar paginación, filtros (`name`, `email`, `phone`, `role_id`,
`business_id`, `is_active`, `sort_by`, `sort_order`, `include_deleted`).

## Pasos

### 1. Paginación básica
- `?page=1&page_size=5` → `pagination.per_page == 5`.
- `?page=2&page_size=5` → si `total > 5`, `data` distinto al de `page=1`.
- `?page=99` con poca data → `data: []`, `has_next:false`, `has_prev:true`.

### 2. Filtros
- `?email=admin@lerida.local` → 1 resultado.
- `?role_id=1` → solo super admins.
- `?business_id=1` → solo users del business 1.
- `?is_active=false` → users inactivos.
- `?include_deleted=true` → incluye soft-deleted.

### 3. Sort
- `?sort_by=email&sort_order=asc` → orden alfabético por email.
- `?sort_by=invalido` → `400` por validador `oneof`.

### 4. Validaciones de query inválidas
- `?page_size=0` → 400.
- `?page_size=200` → 400 (max=100).
- `?phone=abc` → 400 (debe ser len 10).
- `?email=mal` → 400.
- `?created_at=01-2026` → 400 (formato `2006-01-02`).
- `?sort_order=invalido` → 400.

## Notas
- ⚠️ **BUG-USERS-01:** Por defecto el listado parece omitir users sin
  business asociado, incluso para super admin. Confirmar comportamiento.
  Si es intencional, documentar en overview del proyecto.
