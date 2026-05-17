# Reglas de Diseño — Frontend

Paleta del proyecto: **emerald** (verde) + **yellow/amber** (dorado) + **stone** (neutros).
Tailwind v4. No agregar librerías de UI pesadas sin avisar.

## Tablas de datos (OBLIGATORIO — mismo estilo en todos los módulos)

Todas las tablas de listado (IAM, Negocios, Torneos, etc.) usan EXACTAMENTE este
estilo. No inventar variantes por módulo.

### Estructura

```tsx
<div className="rounded-xl border border-stone-200 overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-emerald-950 text-white">
      <tr>
        <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider">…</th>
        {/* última columna de acciones: text-right */}
        <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-stone-100 hover:bg-stone-50 transition-colors">
        <td className="px-4 py-2.5 text-stone-700">…</td>
        <td className="px-4 py-2.5 text-right">{/* botones de acción */}</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Reglas fijas

- **Header**: `bg-emerald-950 text-white`. NUNCA `var(--color-primary)` ni navy de probability.
- **Celdas**: padding `px-4 py-2.5`. Filas densas, no espaciosas (`py-4`/`py-6` prohibido).
- **Fila**: `border-t border-stone-100 hover:bg-stone-50 transition-colors`.
- **`th`**: `text-xs font-semibold uppercase tracking-wider`.
- **Columna de acciones**: siempre la última, alineada a la derecha (`text-right`),
  íconos editar/eliminar.
- **Estado vacío**: `<td colSpan={N} className="px-4 py-8 text-center text-stone-400">`.
- **Texto**: cuerpo `text-stone-700`; secundario/descripciones `text-stone-500`.
- Sin clases `dark:` salvo que el módulo soporte modo oscuro de forma explícita.

## Encabezado de módulo / página

NO usar títulos `<h1>` de página ni subtítulos descriptivos en los módulos del
panel. Son redundantes: la navegación (sidebar + pestañas) ya identifica la
ubicación. Tampoco poner títulos internos dentro de los componentes `List`
(nada de `<h1>Usuarios</h1>` dentro de `UserList`).

La identidad del módulo la dan: el ítem activo del sidebar + la pestaña activa.

## Tabs (pestañas de módulo = navbar secundario)

- Base: `px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2`
- Activo: `bg-yellow-400 text-emerald-950`
- Inactivo: `text-stone-600 hover:bg-stone-200`
- Cada pestaña lleva un ícono (emoji) antes del texto.
- Contenido del tab dentro de `<div className="bg-white rounded-2xl shadow-sm p-5">`.

## Paginación (componente compartido)

Toda tabla paginada usa el componente `Pagination` de `@/shared/ui` — no
reimplementar paginación por módulo. Formato:

- **Izquierda:** `Mostrando <b>X</b> a <b>Y</b> de <b>N</b> resultados` +
  selector `Mostrar: [10|20|50|100]`.
- **Derecha:** controles `«` (primera) · `‹` (anterior) · números de página con
  elipsis `…` · `›` (siguiente) · `»` (última).
- Página activa: `bg-yellow-400 text-emerald-950`; resto:
  `text-stone-600 hover:bg-stone-100`. Botones: `px-2.5 py-1 rounded text-sm`.
- Texto auxiliar: `text-sm text-stone-500`.

## Botones

- Primario / acción: `bg-yellow-400 text-emerald-950 hover:brightness-110`
- Secundario: `bg-white border border-stone-300 text-stone-700 hover:bg-stone-50`
- Peligro: `bg-red-600 text-white hover:bg-red-700`
- Base común: `px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50`

## Tarjetas / contenedores

- Tarjeta de contenido: `bg-white rounded-2xl shadow-sm p-5`
- Borde sutil cuando aplique: `border border-stone-200`

## Sidebar / panel admin

- Fondo: `bg-gradient-to-b from-emerald-950 to-emerald-900 text-white`
- Ítem activo: `bg-yellow-400 text-emerald-950`; inactivo: `text-emerald-100 hover:bg-white/10`
