import { createAdminClient } from "@/lib/supabase/admin"
import { BugReportList } from "@/components/bug-report-list"

type BugReport = {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  author: { name: string } | null
}

export default async function BugReportPage() {
  const admin = createAdminClient()

  let reports: BugReport[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await admin
      .from("bug_reports")
      .select("id, title, content, status, created_at, author:users(name)")
      .order("created_at", { ascending: false })

    if (fetchError) throw fetchError
    reports = (data ?? []) as BugReport[]
  } catch (e) {
    error = e instanceof Error ? e.message : "버그 리포트를 불러오지 못했습니다."
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">버그 리포트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            총 {reports.length}건의 리포트
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <BugReportList reports={reports} />
      )}
    </div>
  )
}
