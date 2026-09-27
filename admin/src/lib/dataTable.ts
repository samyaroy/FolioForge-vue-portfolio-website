import {
  createColumnHelper,
  createCoreRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'

/** Per-column extras: `width` is a CSS width for the fixed table layout. */
export type DataTableColumnMeta = { width?: string }

// Sorting and pagination only: the pages filter their own rows, so the table
// takes what it is given.
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  coreRowModel: createCoreRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
  columnMeta: {} as DataTableColumnMeta,
})

/** Column builder bound to this table's features: `columnsFor<Row>()`. */
export function columnsFor<TData extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, TData>()
}

// TanStack's own guidance: a mixed column list is typed with `any` for the
// cell value, since each accessor narrows it differently.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumns<TData extends RowData> = ColumnDef<typeof dataTableFeatures, TData, any>[]
