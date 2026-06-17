"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createRecipeGuide(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "").trim()
  const category = String(formData.get("category") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()

  if (!title) return { error: "제목을 입력해주세요." }
  if (!content || content === "<p></p>") return { error: "내용을 입력해주세요." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다." }

  const admin = createAdminClient()
  const { data: userData } = await admin
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  const { error } = await admin.from("recipe_guides").insert({
    title,
    category: category || null,
    content,
    author_id: userData?.id ?? null,
  })

  if (error) return { error: "레시피 가이드 등록에 실패했습니다." }

  revalidatePath("/dashboard/recipe-guide")
  return { success: true }
}

export async function deleteRecipeGuide(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const id = String(formData.get("id") ?? "").trim()
  if (!id) return { error: "잘못된 요청입니다." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다." }

  const admin = createAdminClient()
  const { error } = await admin.from("recipe_guides").delete().eq("id", id)

  if (error) return { error: "삭제에 실패했습니다." }

  revalidatePath("/dashboard/recipe-guide")
  return { success: true }
}

export async function updateRecipeGuide(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const id = String(formData.get("id") ?? "").trim()
  const title = String(formData.get("title") ?? "").trim()
  const category = String(formData.get("category") ?? "").trim()
  const content = String(formData.get("content") ?? "").trim()

  if (!id) return { error: "잘못된 요청입니다." }
  if (!title) return { error: "제목을 입력해주세요." }
  if (!content || content === "<p></p>") return { error: "내용을 입력해주세요." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "로그인이 필요합니다." }

  const admin = createAdminClient()
  const { error } = await admin
    .from("recipe_guides")
    .update({ title, category: category || null, content })
    .eq("id", id)

  if (error) return { error: "수정에 실패했습니다." }

  revalidatePath("/dashboard/recipe-guide")
  return { success: true }
}
