import { Cog } from "lucide-react"

export default function ProductionPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">생산 공정</h1>
        <p className="mt-1 text-sm text-muted-foreground">생산 공정 현황을 조회하고 관리합니다.</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center">
        <Cog className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">준비 중입니다</p>
        <p className="mt-1 text-xs text-muted-foreground/70">생산 공정 기능이 곧 추가될 예정입니다.</p>
      </div>
    </div>
  )
}
