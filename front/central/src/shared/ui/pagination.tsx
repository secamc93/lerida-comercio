'use client';

import React from 'react';

export interface PaginationProps {
  /** Página actual (1-based) */
  page: number;
  /** Tamaño de página actual */
  pageSize: number;
  /** Total de registros */
  total: number;
  /** Callback al cambiar de página */
  onPageChange: (page: number) => void;
  /** Callback opcional al cambiar el tamaño de página */
  onPageSizeChange?: (size: number) => void;
  /** Opciones del selector de tamaño de página */
  pageSizeOptions?: number[];
}

/**
 * Calcula los items de página a renderizar: ~5 números alrededor de la
 * página actual, con elipsis y siempre primera/última.
 */
function buildPageItems(current: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | '…')[] = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);

  items.push(1);
  if (left > 2) items.push('…');
  for (let p = left; p <= right; p++) items.push(p);
  if (right < totalPages - 1) items.push('…');
  items.push(totalPages);

  return items;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const desde = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const hasta = Math.min(safePage * pageSize, total);

  const pageItems = buildPageItems(safePage, totalPages);

  const navBtn = 'px-2.5 py-1 rounded text-sm transition';
  const isFirst = safePage <= 1;
  const isLast = safePage >= totalPages;

  const goTo = (p: number) => {
    const target = Math.min(Math.max(1, p), totalPages);
    if (target !== safePage) onPageChange(target);
  };

  return (
    <div className="flex justify-between items-center gap-4 px-1 py-3 text-sm text-stone-500">
      {/* Izquierda: rango + selector de tamaño */}
      <div className="flex items-center gap-4">
        <span>
          Mostrando <b className="text-stone-700">{desde}</b> a{' '}
          <b className="text-stone-700">{hasta}</b> de{' '}
          <b className="text-stone-700">{total}</b> resultados
        </span>
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5">
            Mostrar:
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-stone-300 bg-white px-2 py-1 text-sm text-stone-700"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Derecha: controles de navegación */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goTo(1)}
          disabled={isFirst}
          aria-label="Primera página"
          className={`${navBtn} ${isFirst ? 'opacity-40 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-100'}`}
        >
          «
        </button>
        <button
          type="button"
          onClick={() => goTo(safePage - 1)}
          disabled={isFirst}
          aria-label="Página anterior"
          className={`${navBtn} ${isFirst ? 'opacity-40 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-100'}`}
        >
          ‹
        </button>

        {pageItems.map((item, idx) =>
          item === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-2.5 py-1 text-sm text-stone-400">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goTo(item)}
              aria-current={item === safePage ? 'page' : undefined}
              className={`${navBtn} ${
                item === safePage
                  ? 'bg-yellow-400 text-emerald-950 font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => goTo(safePage + 1)}
          disabled={isLast}
          aria-label="Página siguiente"
          className={`${navBtn} ${isLast ? 'opacity-40 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-100'}`}
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => goTo(totalPages)}
          disabled={isLast}
          aria-label="Última página"
          className={`${navBtn} ${isLast ? 'opacity-40 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-100'}`}
        >
          »
        </button>
      </div>
    </div>
  );
}
