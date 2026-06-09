"use client"

import { useActionState, useEffect, useRef } from "react"
import { createBugReport } from "@/app/actions/bug-reports"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

export function BugReportForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createBugReport, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
      setTimeout(onClose, 400)
    }
  }, [state?.success, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">버그 리포트 작성</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bug-title">제목</Label>
            <Input
              id="bug-title"
              name="title"
              placeholder="버그 제목을 입력하세요"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bug-content">내용</Label>
            <textarea
              id="bug-content"
              name="content"
              placeholder="버그 내용을 자세히 설명해주세요"
              required
              rows={5}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              취소
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
