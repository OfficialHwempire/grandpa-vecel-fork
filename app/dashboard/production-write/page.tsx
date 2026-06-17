import { ClipboardList } from "lucide-react"

export default function ProductionWritePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">생산 공정 작성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          생산 공정 문서를 등록하고 편집합니다.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border py-32 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <ClipboardList className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">준비 중입니다</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          생산 공정 작성 기능이 곧 추가될 예정입니다.
        </p>
      </div>
    </div>
  )
}
