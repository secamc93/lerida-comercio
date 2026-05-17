# 02 — Login con credenciales inválidas

**Módulo:** auth   **Tipo:** front   **Estado:** ✅ OK

## Pasos

### 1. Ir a `/login`.
### 2. Email correcto + password incorrecto
- Email: `admin@lerida.local`, Password: `WRONG`.
- Clic "Iniciar Sesión".
- Esperado: mensaje "credenciales inválidas" (o equivalente) en el formulario.
- URL **no** cambia a `/home`.

### 3. Email inexistente
- Email: `noexiste@x.com`, Password: `x`.
- Esperado: mismo mensaje genérico (no debe diferenciarse si el email existe
  o no — mitigación de user enumeration).

### 4. Campos vacíos
- HTML5 `required` impide submit (no llega al backend).

## Validaciones post
- No se crea cookie de sesión.
- Backend responde 401 (visible en DevTools network).
