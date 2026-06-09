"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Database, Cog, Bug } from "lucide-react"
import { cn } from "@/lib/utils"

export function DashboardSidebar({
  tables,
  isManager,
}: {
  tables: { name: string }[]
  isManager: boolean
}) {
  const pathname = usePathname()
  const isDataTable = pathname.startsWith("/dashboard/data-table")

  const navItems = [
    { label: "직원 관리", href: "/dashboard/employees", icon: Users, visible: isManager },
    { label: "데이터 테이블", href: "/dashboard/data-table", icon: Database, visible: true },
    { label: "생산 공정", href: "/dashboard/production", icon: Cog, visible: true },
    { label: "버그 리포트", href: "/dashboard/bug-report", icon: Bug, visible: true },
  ]

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border">
      <nav className="flex flex-col gap-1 p-4">
        {navItems
          .filter((item) => item.visible)
          .map(({ label, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
      </nav>

      {isDataTable && tables.length > 0 && (
        <div className="flex-1 overflow-y-auto border-t border-border px-4 py-4">
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tables
          </p>
          <nav className="flex flex-col gap-1">
            {tables.map((t) => (
              <Link
                key={t.name}
                href={`/dashboard/data-table/${encodeURIComponent(t.name)}`}
                className={cn(
                  "rounded-md px-2 py-1.5 font-mono text-sm transition-colors",
                  pathname === `/dashboard/data-table/${encodeURIComponent(t.name)}`
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {t.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </aside>
  )
}
