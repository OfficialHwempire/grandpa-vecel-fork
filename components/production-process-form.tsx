"use client"

import { useState, useTransition, useId } from "react"
import {
  Plus,
  Trash2,
  Save,
  X,
  Check,
  XCircle,
  ClipboardList,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  saveProductionProcess,
  approveProductionProcess,
  rejectProductionProcess,
} from "@/app/actions/production-process"
import type { ProcessFromDb } from "@/app/dashboard/production-write/page"

type Step = {
  localId: string
  item: string
  amount: string
  note: string
}

type ProcessTab = {
  localId: string
  dbId: string | null
  productName: string
  status: "pending" | "approved" | "rejected"
  rejectReason: string | null
  authorName: string | null
  approverName: string | null
  steps: Step[]
}

function dbToTab(p: ProcessFromDb): ProcessTab {
  return {
    localId: p.id,
    dbId: p.id,
    productName: p.product_name,
    status: p.status,
    rejectReason: p.reject_reason,
    authorName: p.author?.name ?? null,
    approverName: p.approver?.name ?? null,
    steps: p.steps.map((s) => ({
      localId: s.id,
      item: s.item,
      amount: s.amount_g !== null ? String(s.amount_g) : "",
      note: s.note,
    })),
  }
}

function createStep(): Step {
  return { localId: crypto.randomUUID(), item: "", amount: "", note: "" }
}

function createNewTab(productName: string): ProcessTab {
  return {
    localId: crypto.randomUUID(),
    dbId: null,
    productName,
    status: "pending",
    rejectReason: null,
    authorName: null,
    approverName: null,
    steps: [createStep()],
  }
}

const STATUS_CONFIG = {
  pending: {
    label: "검토 대기중",
    banner: "bg-yellow-50 border-yellow-200 text-yellow-800",
    dot: "bg-yellow-400",
    icon: AlertCircle,
  },
  approved: {
    label: "승인됨",
    banner: "bg-emerald-50 border-emerald-200 text-emerald-800",
    dot: "bg-emerald-500",
    icon: Check,
  },
  rejected: {
    label: "반려됨",
    banner: "bg-red-50 border-red-200 text-red-800",
    dot: "bg-red-500",
    icon: XCircle,
  },
}

export function ProductionProcessForm({
  initialProcesses,
  isManager,
}: {
  initialProcesses: ProcessFromDb[]
  isManager: boolean
}) {
  const uid = useId()
  const [isPending, startTransition] = useTransition()

  const [tabs, setTabs] = useState<ProcessTab[]>(() =>
    initialProcesses.length > 0
      ? initialProcesses.map(dbToTab)
      : [createNewTab("샌드위치")],
  )
  const [activeLocalId, setActiveLocalId] = useState<string>(() => tabs[0]?.localId ?? "")
  const [showNewTab, setShowNewTab] = useState(false)
  const [newTabName, setNewTabName] = useState("")
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [rejectDraft, setRejectDraft] = useState<{ processId: string; reason: string } | null>(
    null,
  )

  const active = tabs.find((t) => t.localId === activeLocalId)

  function flash(type: "success" | "error", text: string) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  function updateStep(localId: string, field: keyof Step, value: string) {
    setTabs((prev) =>
      prev.map((t) =>
        t.localId !== activeLocalId
          ? t
          : { ...t, steps: t.steps.map((s) => (s.localId === localId ? { ...s, [field]: value } : s)) },
      ),
    )
  }

  function addStep() {
    setTabs((prev) =>
      prev.map((t) =>
        t.localId === activeLocalId ? { ...t, steps: [...t.steps, createStep()] } : t,
      ),
    )
  }

  function removeStep(stepLocalId: string) {
    setTabs((prev) =>
      prev.map((t) =>
        t.localId !== activeLocalId
          ? t
          : { ...t, steps: t.steps.filter((s) => s.localId !== stepLocalId) },
      ),
    )
  }

  function addTab() {
    const name = newTabName.trim()
    if (!name) return
    const tab = createNewTab(name)
    setTabs((prev) => [...prev, tab])
    setActiveLocalId(tab.localId)
    setNewTabName("")
    setShowNewTab(false)
  }

  function removeTab(localId: string) {
    if (tabs.length === 1) return
    const remaining = tabs.filter((t) => t.localId !== localId)
    setTabs(remaining)
    if (activeLocalId === localId) setActiveLocalId(remaining[0].localId)
  }

  function handleSave() {
    if (!active) return
    startTransition(async () => {
      const steps = active.steps.map((s, i) => ({
        step_order: i + 1,
        item: s.item,
        amount_g: s.amount !== "" ? parseFloat(s.amount) : null,
        note: s.note,
      }))
      const result = await saveProductionProcess(active.dbId, active.productName, steps)
      if (result.error) {
        flash("error", result.error)
      } else if (result.processId) {
        setTabs((prev) =>
          prev.map((t) =>
            t.localId === active.localId
              ? { ...t, dbId: result.processId!, status: "pending", rejectReason: null }
              : t,
          ),
        )
        flash("success", "저장됐습니다.")
      }
    })
  }

  function handleApprove(processId: string) {
    startTransition(async () => {
      const result = await approveProductionProcess(processId)
      if (result.error) {
        flash("error", result.error)
      } else {
        setTabs((prev) =>
          prev.map((t) => (t.dbId === processId ? { ...t, status: "approved" } : t)),
        )
        flash("success", "승인됐습니다.")
      }
    })
  }

  function handleReject(processId: string, reason: string) {
    startTransition(async () => {
      const result = await rejectProductionProcess(processId, reason)
      if (result.error) {
        flash("error", result.error)
      } else {
        setTabs((prev) =>
          prev.map((t) =>
            t.dbId === processId ? { ...t, status: "rejected", rejectReason: reason } : t,
          ),
        )
        setRejectDraft(null)
        flash("success", "반려 처리됐습니다.")
      }
    })
  }

  const statusCfg = STATUS_CONFIG[active?.status ?? "pending"]
  const StatusIcon = statusCfg.icon
  const totalG = (active?.steps ?? []).reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0,
  )

  return (
    <div className="flex flex-col gap-5">
      {/* ── 탭 바 ── */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((t) => {
          const dot = STATUS_CONFIG[t.status].dot
          return (
            <div key={t.localId} className="group relative flex items-center">
              <button
                type="button"
                onClick={() => setActiveLocalId(t.localId)}
                className={cn(
                  "flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  t.localId === activeLocalId
                    ? "border-emerald-500 text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                {t.productName}
                <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
              </button>

              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTab(t.localId)}
                  className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-600 group-hover:flex"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          )
        })}

        {showNewTab ? (
          <div className="flex items-center gap-1.5 px-2">
            <Input
              autoFocus
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTab()
                if (e.key === "Escape") setShowNewTab(false)
              }}
              placeholder="제품명 입력"
              className="h-7 w-28 text-xs"
            />
            <Button size="xs" onClick={addTab}>
              확인
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setShowNewTab(false)}>
              취소
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewTab(true)}
            className="ml-1 flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            제품 추가
          </button>
        )}
      </div>

      {/* ── 승인 상태 배너 ── */}
      {active && (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border px-4 py-2.5",
            statusCfg.banner,
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            <StatusIcon className="h-4 w-4 shrink-0" />
            <span className="font-medium">{statusCfg.label}</span>
            {active.status === "rejected" && active.rejectReason && (
              <span className="opacity-75">— {active.rejectReason}</span>
            )}
            {active.status === "approved" && active.approverName && (
              <span className="opacity-75">— {active.approverName} 승인</span>
            )}
            {!active.dbId && (
              <span className="opacity-60">(저장 전)</span>
            )}
          </div>

          {/* 점장 전용: 승인 / 반려 */}
          {isManager && active.dbId && active.status === "pending" && (
            <div className="flex items-center gap-2">
              {rejectDraft?.processId === active.dbId ? (
                <>
                  <Input
                    autoFocus
                    value={rejectDraft.reason}
                    onChange={(e) =>
                      setRejectDraft({ processId: active.dbId!, reason: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleReject(active.dbId!, rejectDraft.reason)
                      if (e.key === "Escape") setRejectDraft(null)
                    }}
                    placeholder="반려 사유 입력"
                    className="h-7 w-44 bg-white/70 text-xs"
                  />
                  <Button
                    size="xs"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => handleReject(active.dbId!, rejectDraft.reason)}
                  >
                    확인
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setRejectDraft(null)}>
                    취소
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="xs"
                    disabled={isPending}
                    onClick={() => handleApprove(active.dbId!)}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    승인
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => setRejectDraft({ processId: active.dbId!, reason: "" })}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    반려
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 공정 단계 테이블 ── */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="w-14 px-4 py-3 text-center">단계</th>
              <th className="px-4 py-3">품목</th>
              <th className="w-36 px-4 py-3">단위 (g)</th>
              <th className="px-4 py-3">비고</th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {active?.steps.map((step, idx) => (
              <tr key={step.localId} className="group transition-colors hover:bg-muted/30">
                <td className="px-4 py-2.5 text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                    {idx + 1}
                  </span>
                </td>

                <td className="px-4 py-2">
                  <Input
                    id={`${uid}-item-${step.localId}`}
                    value={step.item}
                    onChange={(e) => updateStep(step.localId, "item", e.target.value)}
                    placeholder="품목명 입력"
                    className="h-8 border-none bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-emerald-500/40"
                  />
                </td>

                <td className="px-4 py-2">
                  <div className="relative">
                    <Input
                      id={`${uid}-amount-${step.localId}`}
                      type="number"
                      min="0"
                      value={step.amount}
                      onChange={(e) => updateStep(step.localId, "amount", e.target.value)}
                      placeholder="0"
                      className="h-8 border-none bg-transparent pr-7 shadow-none focus-visible:ring-1 focus-visible:ring-emerald-500/40"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      g
                    </span>
                  </div>
                </td>

                <td className="px-4 py-2">
                  <Input
                    id={`${uid}-note-${step.localId}`}
                    value={step.note}
                    onChange={(e) => updateStep(step.localId, "note", e.target.value)}
                    placeholder="비고 사항 입력"
                    className="h-8 border-none bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-emerald-500/40"
                  />
                </td>

                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeStep(step.localId)}
                    disabled={(active.steps.length ?? 0) <= 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:pointer-events-none disabled:opacity-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* + 단계 추가 */}
        <div className="border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={addStep}
            className="flex w-full items-center justify-center gap-1.5 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            단계 추가
          </button>
        </div>
      </div>

      {/* ── 하단 푸터 ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            총{" "}
            <span className="font-semibold text-foreground">{active?.steps.length ?? 0}</span>
            단계 · <span className="font-semibold text-foreground">{totalG.toFixed(1)}</span> g
          </p>
          {msg && (
            <span
              className={cn(
                "text-xs font-medium",
                msg.type === "success" ? "text-emerald-600" : "text-red-600",
              )}
            >
              {msg.text}
            </span>
          )}
        </div>

        <Button onClick={handleSave} disabled={isPending} size="sm" className="gap-2">
          <Save className="h-3.5 w-3.5" />
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  )
}
