# 03 — Cambiar contraseña

**Módulo:** auth   **Tipo:** front   **Estado:** ✅ OK

## Objetivo
Validaciones de cliente, validaciones de servidor (current password
incorrecta) y cambio real ida-y-vuelta (sin dejar la password rota para
otros tests).

## Precondiciones
- Sesión activa de `admin@lerida.local`.
- Acceder a `/cambiar-password`.

## Pasos

### 1. Submit con campos vacíos
- Esperado: error cliente "Todos los campos son requeridos".

### 2. Nueva password con menos de 8 caracteres
- Actual: `admin123`. Nueva/Confirm: `short`.
- Esperado: error cliente "La nueva contraseña debe tener al menos 8 caracteres".

### 3. Nueva y confirmación no coinciden
- Nueva: `MismaQueActual123`. Confirm: `OtraDistinta456`.
- Esperado: error cliente "Las contraseñas no coinciden".

### 4. Actual incorrecta (validación server)
- Actual: `WRONG_PASS`. Nueva/Confirm: `Cambio2026!`.
- Esperado: error server "Contraseña actual incorrecta". Status 401 en el
  request al backend.

### 5. Cambio exitoso
- Actual: `admin123`. Nueva/Confirm: `Cambio2026!`.
- Esperado: mensaje "Contraseña cambiada exitosamente".

### 6. Restaurar (importante)
- Actual: `Cambio2026!`. Nueva/Confirm: `admin123`.
- Esperado: éxito. Verificar con login API que `admin@lerida.local /
  admin123` vuelve a funcionar.

## Validaciones post
- DB: hash en `"user".password` cambió (sin verificarse el valor exacto).
- Login con admin123 sigue funcionando al finalizar (paso 6).

## Notas
- Ejecutar siempre el paso 6. Si se omite, la password queda como
  `Cambio2026!` y rompe los tests de otros módulos.
