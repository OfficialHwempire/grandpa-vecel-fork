"use client"

import Image from "next/image"
import { useState, useRef, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { updateRow } from "@/app/actions/table-edit"

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"]

const CODE_RE = /^(?:RAW|PROD)-([A-Z][A-Z0-9_]*)-(\d+)$/i

function deriveImageSrc(code: string, extIdx: number): string | null {
  const match = code.match(CODE_RE)
  if (!match) return null
  const category = match[1].toUpperCase()
  const num = match[2]
  return `/api/images/${category}/${category}-${num}.${IMAGE_EXTS[extIdx]}`
}

function PhotoCell({ row }: { row: Record<string, unknown> }) {
  const code = String(row["raw_code"] ?? row["prod_code"] ?? "")
  const [extIdx, setExtIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  const src = !failed ? deriveImageSrc(code, extIdx) : null

  if (!src) return <span className="text-muted-foreground">-</span>

  return (
    <Image
      src={src}
      alt={code}
      width={100}
      height={100}
      className="rounded object-contain"
      onError={() => {
        if (extIdx + 1 < IMAGE_EXTS.length) setExtIdx(extIdx + 1)
        else setFailed(true)
      }}
      unoptimized
    />
  )
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") return JSON.stringify(value)
  if (typeof value === "boolean") return value ? "true" : "false"
  return String(value)
}

function CodeImageCell({ code }: { code: string }) {
  const [extIdx, setExtIdx] = useState(0)
  const [failed, setFailed] = useState(false)

  const src = !failed ? deriveImageSrc(code, extIdx) : null

  if (!src) return <span className="font-mono text-xs">{code}</span>

  return (
    <div className="flex flex-col items-center gap-1">
      <Image
        src={src}
        alt={code}
        width={100}
        height={100}
        className="rounded object-contain"
        onError={() => {
          if (extIdx + 1 < IMAGE_EXTS.length) setExtIdx(extIdx + 1)
          else setFailed(true)
        }}
        unoptimized
      />
      <span className="font-mono text-xs text-muted-foreground">{code}</span>
    </div>
  )
}

function CellContent({ col, value, row }: { col: string; value: unknown; row: Record<string, unknown> }) {
  if (col === "photo") return <PhotoCell row={row} />
  const text = formatCell(value)
  if (text === "") return <span className="text-muted-foreground">null</span>
  if (CODE_RE.test(text)) return <CodeImageCell code={text.toUpperCase()} />
  return <span title={text}>{text}</span>
}

type ErrorEntry = {
  id: number
  timestamp: string
  column: string
  pkValue: string
  attempted: string
  message: string
}

function EditableCell({
  col,
  value,
  row,
  tableName,
  pkColumn,
  onRowUpdate,
  onError,
}: {
  col: string
  value: unknown
  row: Record<string, unknown>
  tableName: string
  pkColumn: string
  onRowUpdate: (pkValue: string, col: string, newValue: unknown) => void
  onError: (e: Omit<ErrorEntry, "id">) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editStr, setEditStr] = useState("")
  const [saving, setSaving] = useState(false)
  const escapeRef = useRef(false)

  const pkValue = String(row[pkColumn] ?? "")
  const canEdit = col !== pkColumn && col !== "photo"
  const originalStr = formatCell(value)

  const handleSave = useCallback(async () => {
    if (escapeRef.current) {
      escapeRef.current = false
      return
    }
    setEditing(false)

    if (editStr === originalStr || (editStr === "" && (value === null || value === undefined))) {
      return
    }

    setSaving(true)
    const originalType = value === null || value === undefined ? "null" : typeof value
    const result = await updateRow(tableName, pkColumn, pkValue, col, editStr, originalType)
    setSaving(false)

    if (result.error) {
      onError({
        timestamp: new Date().toLocaleString("ko-KR"),
        column: col,
        pkValue,
        attempted: editStr,
        message: result.error,
      })
    } else {
      let newValue: unknown = editStr
      if (editStr === "" || editStr === "null") newValue = null
      else if (originalType === "number") {
        const n = Number(editStr)
        if (!isNaN(n)) newValue = n
      } else if (originalType === "boolean") {
        if (editStr === "true") newValue = true
        else if (editStr === "false") newValue = false
      }
      onRowUpdate(pkValue, col, newValue)
    }
  }, [editStr, originalStr, value, tableName, pkColumn, pkValue, col, onRowUpdate, onError])

  if (!canEdit) {
    return <CellContent col={col} value={value} row={row} />
  }

  if (editing) {
    return (
      <input
        value={editStr}
        onChange={(e) => setEditStr(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            handleSave()
          }
          if (e.key === "Escape") {
            e.preventDefault()
            escapeRef.current = true
            setEditing(false)
          }
        }}
        className="w-full min-w-[80px] rounded border border-ring bg-background px-1 py-0.5 font-mono text-xs outline-none ring-1 ring-ring"
        autoFocus
      />
    )
  }

  return (
    <div
      onClick={() => {
        if (!saving) {
          setEditStr(originalStr)
          setEditing(true)
        }
      }}
      title={saving ? "저장 중..." : "클릭하여 편집"}
      className={`-mx-1 -my-0.5 cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-accent/60 ${saving ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {saving ? (
        <span className="font-mono text-xs text-muted-foreground italic">저장 중...</span>
      ) : (
        <CellContent col={col} value={value} row={row} />
      )}
    </div>
  )
}

export function DataTable({
  columns,
  rows: initialRows,
  tableName,
  pkColumn,
}: {
  columns: string[]
  rows: Record<string, unknown>[]
  tableName?: string
  pkColumn?: string | null
}) {
  const [rows, setRows] = useState(initialRows)
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const errorCounter = useRef(0)

  const handleRowUpdate = useCallback(
    (pkValue: string, col: string, newValue: unknown) => {
      if (!pkColumn) return
      setRows((prev) =>
        prev.map((row) =>
          String(row[pkColumn] ?? "") === pkValue ? { ...row, [col]: newValue } : row,
        ),
      )
    },
    [pkColumn],
  )

  const handleError = useCallback((e: Omit<ErrorEntry, "id">) => {
    setErrors((prev) => [{ ...e, id: ++errorCounter.current }, ...prev])
  }, [])

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
        <p className="text-sm text-muted-foreground">This table has no rows.</p>
      </div>
    )
  }

  const editable = !!tableName && !!pkColumn

  return (
    <div className="flex flex-col gap-3">
      {editable && (
        <p className="text-xs text-muted-foreground">
          셀을 클릭하면 편집할 수 있습니다. Enter로 저장, Esc로 취소.
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap font-mono text-xs">
                  {col}
                  {editable && col === pkColumn && (
                    <span className="ml-1 text-[10px] text-muted-foreground">(PK)</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col} className="max-w-xs font-mono text-xs">
                    {editable ? (
                      <EditableCell
                        col={col}
                        value={row[col]}
                        row={row}
                        tableName={tableName}
                        pkColumn={pkColumn}
                        onRowUpdate={handleRowUpdate}
                        onError={handleError}
                      />
                    ) : (
                      <CellContent col={col} value={row[col]} row={row} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-destructive">에러 로그 ({errors.length})</p>
            <button
              onClick={() => setErrors([])}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              지우기
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {errors.map((err) => (
              <div key={err.id} className="rounded border border-destructive/20 bg-background p-2 font-mono text-xs">
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
                  <span>{err.timestamp}</span>
                  <span>
                    column: <span className="text-foreground">{err.column}</span>
                  </span>
                  <span>
                    pk: <span className="text-foreground">{err.pkValue}</span>
                  </span>
                  <span>
                    value: <span className="text-foreground">&quot;{err.attempted}&quot;</span>
                  </span>
                </div>
                <p className="mt-1 text-destructive">{err.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
