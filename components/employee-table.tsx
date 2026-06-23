"use client"

import { useState, useTransition } from "react"
import { updateUserStatus, updateUserPosition, updateUserField } from "@/app/actions/users"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = ["재직", "휴직", "퇴사"] as const

// positions 행에서 표시할 레이블을 추출
function getPositionLabel(pos: Record<string, unknown>): string {
  return typeof pos.name_ko === "string" ? pos.name_ko : String(pos.id ?? "")
}

type Position = { id: string; label: string }

function toPositions(rows: Record<string, unknown>[]): Position[] {
  return rows.map((r) => ({ id: String(r.id), label: getPositionLabel(r) }))
}

export function EmployeeTable({
  users,
  positions: positionRows,
}: {
  users: Record<string, unknown>[]
  positions: Record<string, unknown>[]
}) {
  const positions = toPositions(positionRows)

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">등록된 직원이 없습니다.</p>
  }

  const columns = Object.keys(users[0])

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <UserRow
              key={String(user.id ?? i)}
              user={user}
              columns={columns}
              positions={positions}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserRow({
  user,
  columns,
  positions,
}: {
  user: Record<string, unknown>
  columns: string[]
  positions: Position[]
}) {
  const [status, setStatus] = useState(String(user.status ?? "재직"))
  const [positionId, setPositionId] = useState(String(user.position_id ?? ""))
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const col of columns) {
      if (col !== "status" && col !== "position_id") {
        init[col] = user[col] === null || user[col] === undefined ? "" : String(user[col])
      }
    }
    return init
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStatusChange(newStatus: string) {
    const prev = status
    setStatus(newStatus)
    setError(null)
    startTransition(async () => {
      try {
        await updateUserStatus(user.id, newStatus)
      } catch (e) {
        setStatus(prev)
        setError(e instanceof Error ? e.message : "변경 실패")
      }
    })
  }

  function handlePositionChange(newPositionId: string) {
    const prev = positionId
    setPositionId(newPositionId)
    setError(null)
    startTransition(async () => {
      try {
        await updateUserPosition(user.id, newPositionId)
      } catch (e) {
        setPositionId(prev)
        setError(e instanceof Error ? e.message : "변경 실패")
      }
    })
  }

  function handleFieldBlur(col: string, value: string) {
    const original = user[col] === null || user[col] === undefined ? "" : String(user[col])
    if (value === original) return
    setError(null)
    startTransition(async () => {
      try {
        await updateUserField(user.id, col, value)
      } catch (e) {
        setFieldValues((prev) => ({ ...prev, [col]: original }))
        setError(e instanceof Error ? e.message : "변경 실패")
      }
    })
  }

  const selectClass = cn(
    "rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring",
    isPending && "cursor-not-allowed opacity-50",
    error && "border-destructive",
  )

  return (
    <>
      <tr className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
        {columns.map((col) => (
          <td key={col} className="px-4 py-3">
            {col === "status" ? (
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isPending}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : col === "position_id" ? (
              <select
                value={positionId}
                onChange={(e) => handlePositionChange(e.target.value)}
                disabled={isPending || positions.length === 0}
                className={selectClass}
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            ) : col === "id" ? (
              <span className="font-mono text-xs text-muted-foreground">
                {String(user[col] ?? "")}
              </span>
            ) : (
              <input
                value={fieldValues[col] ?? ""}
                disabled={isPending}
                onChange={(e) => setFieldValues((prev) => ({ ...prev, [col]: e.target.value }))}
                onBlur={(e) => handleFieldBlur(col, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur() }}
                className={cn(
                  "w-full min-w-[80px] rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-xs outline-none hover:border-border focus:border-ring focus:ring-1 focus:ring-ring",
                  isPending && "cursor-not-allowed opacity-50",
                )}
              />
            )}
          </td>
        ))}
      </tr>
      {error && (
        <tr className="border-b border-border last:border-0">
          <td colSpan={columns.length} className="px-4 py-2 text-xs text-destructive">
            {error}
          </td>
        </tr>
      )}
    </>
  )
}
