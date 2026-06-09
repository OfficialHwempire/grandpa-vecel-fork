"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BugReportForm } from "@/components/bug-report-form"
import { Plus } from "lucide-react"

type BugReport = {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  author: { name: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  접수: "bg-blue-500/10 text-blue-600",
  처리중: "bg-yellow-500/10 text-yellow-600",
  완료: "bg-green-500/10 text-green-600",
}

export function BugReportList({ reports }: { reports: BugReport[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          버그 작성
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
          <p className="text-sm font-medium text-muted-foreground">등록된 버그 리포트가 없습니다</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-card-foreground">{report.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[report.status] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {report.content}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{report.author?.name ?? "알 수 없음"}</span>
                <span>·</span>
                <span>
                  {new Date(report.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && <BugReportForm onClose={() => setOpen(false)} />}
    </>
  )
}
