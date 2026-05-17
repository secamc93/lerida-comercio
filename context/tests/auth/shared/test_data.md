# Datos base — Auth

## Super Admin (creado por seed `back/migration/cmd/main.go`)

| Campo    | Valor                  |
|----------|------------------------|
| Email    | `admin@lerida.local`   |
| Password | `admin123`             |
| Rol      | Super Admin (id=1)     |
| Scope    | `platform`             |

## Endpoint base

```
http://localhost:3050/api/v1
```

## Login rápido (script de helper)

```bash
TOKEN=$(curl -s -X POST http://localhost:3050/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Client-Type: api" \
  -d '{"email":"admin@lerida.local","password":"admin123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['token'])")
echo "$TOKEN"
```

Después: `-H "Authorization: Bearer $TOKEN"` en cada request protegido.

## Headers obligatorios para tests E2E

| Header           | Valor   | Por qué                                          |
|------------------|---------|--------------------------------------------------|
| `X-Client-Type`  | `api`   | Sin esto, el backend setea cookie HttpOnly y vacía `token` en el body (ver auth/RESULTS.md). |
| `Content-Type`   | `application/json` | Para POST/PUT.                       |
| `Authorization`  | `Bearer <TOKEN>`   | En todos los endpoints excepto `POST /auth/login`. |

## Roles sembrados

| ID | Nombre        | Scope    | Level | is_system | business_type_id |
|----|---------------|----------|-------|-----------|------------------|
| 1  | Super Admin   | platform | 1     | true      | 0                |
| 2  | Operador      | platform | 2     | true      | 0                |
| 3  | Administrador | business | 1     | false     | 1 (Lerida Comercio) |
