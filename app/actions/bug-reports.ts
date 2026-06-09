"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createBugReport(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()

  if (!title) return { error: "제목을 입력해주세요." }
  if (!content) return { error: "내용을 입력해주세요." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다." }

  // public.users의 id 확인 (author_id용)
  const admin = createAdminClient()
  const { data: userData } = await admin
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  const { error } = await admin.from("bug_reports").insert({
    title,
    content,
    author_id: userData?.id ?? null,
  })

  if (error) return { error: "버그 리포트 등록에 실패했습니다." }

  revalidatePath("/dashboard/bug-report")
  return { success: true }
}
