"use server"

import { updateTableRow } from "@/lib/supabase/db"

export async function updateRow(
  table: string,
  pkColumn: string,
  pkValue: string,
  column: string,
  newValue: string,
  originalType: string,
): Promise<{ error: string | null }> {
  try {
    let parsed: unknown = newValue

    if (newValue === "" || newValue === "null") {
      parsed = null
    } else if (originalType === "number") {
      const n = Number(newValue)
      if (!isNaN(n)) parsed = n
    } else if (originalType === "boolean") {
      if (newValue === "true") parsed = true
      else if (newValue === "false") parsed = false
    } else if (originalType === "object") {
      try {
        parsed = JSON.parse(newValue)
      } catch {}
    }

    await updateTableRow(table, pkColumn, pkValue, { [column]: parsed })
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
}
