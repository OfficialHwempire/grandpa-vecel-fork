import Link from "next/link"
import { getTables, getTableRows } from "@/lib/supabase/db"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 50

export default async function TablePage({
  params,
  searchParams,
}: {
  params: Promise<{ table: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { table } = await params
  const tableName = decodeURIComponent(table)
  const { page } = await searchParams
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  let columns: string[] = []
  let pkColumn: string | null = null
  try {
    const tables = await getTables()
    const match = tables.find((t) => t.name === tableName)
    const allColumns = match?.columns.map((c) => c.name) ?? []
    if (allColumns.includes("id")) pkColumn = "id"
    columns = allColumns.filter((c) => c !== "id")
  } catch {
    // fall back to columns derived from rows below
  }

  let rows: Record<string, unknown>[] = []
  let total: number | null = null
  let error: string | null = null
  try {
    const result = await getTableRows(tableName, PAGE_SIZE, offset)
    rows = result.rows
    total = result.total
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load rows"
  }

  if (columns.length === 0 && rows.length > 0) {
    const allColumns = Object.keys(rows[0])
    if (!pkColumn && allColumns.includes("id")) pkColumn = "id"
    columns = allColumns.filter((c) => c !== "id")
  }

  const totalPages = total !== null ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">{tableName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total !== null ? `${total} ${total === 1 ? "row" : "rows"}` : "Showing rows"}
            {" · "}
            {columns.length} columns
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <DataTable columns={columns} rows={rows} tableName={tableName} pkColumn={pkColumn} />

          {totalPages !== null && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} asChild={currentPage > 1}>
                  {currentPage > 1 ? (
                    <Link href={`/dashboard/data-table/${encodeURIComponent(tableName)}?page=${currentPage - 1}`}>
                      Previous
                    </Link>
                  ) : (
                    <span>Previous</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  asChild={currentPage < totalPages}
                >
                  {currentPage < totalPages ? (
                    <Link href={`/dashboard/data-table/${encodeURIComponent(tableName)}?page=${currentPage + 1}`}>
                      Next
                    </Link>
                  ) : (
                    <span>Next</span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
