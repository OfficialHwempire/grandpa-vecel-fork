import Link from "next/link"
import { redirect } from "next/navigation"
import { getTables } from "@/lib/supabase/db"
import { isAuthenticated } from "@/lib/auth"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!(await isAuthenticated())) {
    redirect("/login")
  }

  let tables: { name: string }[] = []
  let tablesError: string | null = null
  try {
    tables = await getTables()
  } catch (e) {
    tablesError = e instanceof Error ? e.message : "Could not load tables"
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            Database
          </Link>
        </div>
        <SignOutButton />
      </header>

      <div className="flex flex-1">
        <aside className="w-60 shrink-0 border-r border-border p-4">
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tables
          </p>
          {tablesError ? (
            <p className="px-2 text-sm text-destructive">{tablesError}</p>
          ) : tables.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">No tables found.</p>
          ) : (
            <nav className="flex flex-col gap-1">
              {tables.map((t) => (
                <Link
                  key={t.name}
                  href={`/dashboard/${encodeURIComponent(t.name)}`}
                  className="rounded-md px-2 py-1.5 font-mono text-sm text-foreground transition-colors hover:bg-muted"
                >
                  {t.name}
                </Link>
              ))}
            </nav>
          )}
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
