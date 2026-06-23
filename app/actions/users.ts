"use server"

import { revalidatePath } from "next/cache"
import { SUPABASE_URL } from "@/lib/supabase/config"

async function patchUser(userId: unknown, payload: Record<string, unknown>) {
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(String(userId))}`,
    {
      method: "PATCH",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    },
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`업데이트 실패 (${res.status}): ${text}`)
  }

  revalidatePath("/dashboard/employees")
}

export async function updateUserStatus(userId: unknown, status: string) {
  await patchUser(userId, { status })
}

export async function updateUserPosition(userId: unknown, positionId: string) {
  await patchUser(userId, { position_id: positionId })
}

export async function updateUserField(userId: unknown, field: string, value: string) {
  await patchUser(userId, { [field]: value })
}
