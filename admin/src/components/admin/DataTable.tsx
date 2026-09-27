import { useState } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react'
import { flexRender, useTable, type RowData, type SortingState } from '@tanstack/react-table'
import { Button, IconButton } from '@/components/form'
import { dataTableFeatures, type DataTableColumns } from '@/lib/dataTable'

type DataTableProps<TData extends RowData> = {
  columns: DataTableColumns<TData>
  data: TData[]
  /** Rows per page; pass 0 to show every row without pager controls. */
  pageSize?: number
  emptyTitle: string
  emptyDetail: string
  caption?: string
  labelledBy?: string
  /** A class per row, for a table that reads its rows' state as colour. */
  rowClassName?: (row: TData) => string | undefined
}

export function DataTable<TData extends RowData>({ columns, data, pageSize = 25, emptyTitle, emptyDetail, caption, labelledBy, rowClassName }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: pageSize || data.length || 1 })

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  })

  const rows = table.getPaginatedRowModel().rows
  const pageCount = table.getPageCount()

  return (
    <>
      <div className="table-wrap">
        <table className="data-table">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const sorted = header.column.getIsSorted()
                  const sortable = header.column.getCanSort()
                  return (
                    <th
                      key={header.id}
                      id={header.index === 0 ? labelledBy : undefined}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                      style={header.column.columnDef.meta?.width ? { width: header.column.columnDef.meta.width } : undefined}
                    >
                      {header.isPlaceholder ? null : sortable ? (
                        <Button variant="bare" size="none" className="column-sort" onClick={header.column.getToggleSortingHandler()}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === 'asc' ? <ArrowUp aria-hidden="true" /> : sorted === 'desc' ? <ArrowDown aria-hidden="true" /> : <ChevronsUpDown aria-hidden="true" className="column-sort-idle" />}
                        </Button>
                      ) : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className={rowClassName?.(row.original)}>
                {row.getAllCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!data.length && <div className="empty-state"><strong>{emptyTitle}</strong><span>{emptyDetail}</span></div>}
      </div>
      {pageCount > 1 && (
        <footer className="table-footer">
          <span>Showing {rows.length} of {data.length}</span>
          <div className="table-pager">
            <IconButton variant="outline" size="icon-xs" label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeft aria-hidden="true" /></IconButton>
            <span>Page {pagination.pageIndex + 1} of {pageCount}</span>
            <IconButton variant="outline" size="icon-xs" label="Next page" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRight aria-hidden="true" /></IconButton>
          </div>
        </footer>
      )}
    </>
  )
}
