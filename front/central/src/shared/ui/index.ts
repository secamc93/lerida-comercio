/**
 * Barrel de componentes UI compartidos
 */

export * from './alert';
export * from './avatar-upload';
export * from './badge';
export * from './button';
export * from './filters';
export * from './dynamic-filters';
export * from './confirm-modal';
export * from './date-picker';
export * from './date-range-picker';
export * from './file-input';
export * from './form-modal';
export * from './full-width-modal';
export * from './input';
export * from './secret-input';
export * from './modal';
export { Pagination } from './pagination';
export type { PaginationProps as PaginationComponentProps } from './pagination';
export * from './select';
export * from './sidebar';
export * from './spinner';
export * from './stepper';
export * from './table';
export * from './user-profile-modal';
export * from './footer';
export * from './shopify-iframe-detector';
export * from './theme-toggle';
export * from './dashboard-panel';
export * from './login-hero-panel';

// Re-exportar tipos útiles
export type {
  TableColumn,
  PaginationProps,
  TableFiltersProps,
} from './table';

export type {
  FilterOption,
  ActiveFilter,
} from './dynamic-filters';
