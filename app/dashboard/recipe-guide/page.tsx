import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { RecipeGuideList } from "@/components/recipe-guide-list"

type RecipeGuide = {
  id: string
  title: string
  category: string | null
  content: string
  created_at: string
  author: { name: string } | null
}

export default async function RecipeGuidePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: userData } = await admin
    .from("users")
    .select("name")
    .eq("id", user?.id ?? "")
    .maybeSingle()

  const authorName = userData?.name ?? "알 수 없음"

  let guides: RecipeGuide[] = []
  let error: string | null = null

  try {
    const { data, error: fetchError } = await admin
      .from("recipe_guides")
      .select("id, title, category, content, created_at, author:users(name)")
      .order("created_at", { ascending: false })

    if (fetchError) throw fetchError
    guides = (data ?? []) as RecipeGuide[]
  } catch (e) {
    error = e instanceof Error ? e.message : "레시피 가이드 목록을 불러오지 못했습니다."
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">레시피 가이드</h1>
        <p className="mt-1 text-sm text-muted-foreground">총 {guides.length}건의 가이드</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <RecipeGuideList guides={guides} authorName={authorName} />
      )}
    </div>
  )
}
