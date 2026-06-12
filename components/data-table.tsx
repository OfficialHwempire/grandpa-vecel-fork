"use client"

import Image from "next/image"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"]

// Matches RAW-SDS-001, PROD-SDS-001, RAW-PACK_AUX-002, etc.
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

export function DataTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: Record<string, unknown>[]
}) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
        <p className="text-sm text-muted-foreground">This table has no rows.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col} className="whitespace-nowrap font-mono text-xs">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col} className="max-w-xs font-mono text-xs">
                  <CellContent col={col} value={row[col]} row={row} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
