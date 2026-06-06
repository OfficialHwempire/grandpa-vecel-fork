import Link from "next/link"
import { getTables, getTableCount } from "@/lib/supabase/db"

export default async function DashboardPage() {
  let tables: { name: string; columns: { name: string }[] }[] = []
  let error: string | null = null
  try {
    tables = await getTables()
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not load database"
  }

  const counts = await Promise.all(
    tables.map(async (t) => ({ name: t.name, count: await getTableCount(t.name) })),
  )
  const countMap = new Map(counts.map((c) => [c.name, c.count]))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tables.length} {tables.length === 1 ? "table" : "tables"} in your Supabase database
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <Link
              key={t.name}
              href={`/dashboard/${encodeURIComponent(t.name)}`}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"
            >
              <p className="font-mono text-sm font-medium text-card-foreground">{t.name}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.columns.length} columns</span>
                <span>
                  {countMap.get(t.name) ?? "?"} {countMap.get(t.name) === 1 ? "row" : "rows"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
