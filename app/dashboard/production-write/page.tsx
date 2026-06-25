import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProductionProcessForm } from "@/components/production-process-form"

export type ProcessFromDb = {
  id: string
  product_name: string
  status: "pending" | "approved" | "rejected"
  reject_reason: string | null
  author: { name: string } | null
  approver: { name: string } | null
  steps: {
    id: string
    step_order: number
    item: string
    amount_g: number | null
    note: string
  }[]
}

export default async function ProductionWritePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: userData } = await admin
    .from("users")
    .select("positions(name_ko)")
    .eq("id", user?.id ?? "")
    .maybeSingle()

  const positionName = (userData?.positions as { name_ko: string } | null)?.name_ko ?? ""
  const isManager = positionName === "점장"

  let processes: ProcessFromDb[] = []
  try {
    const { data } = await admin
      .from("tb_production_process")
      .select(`
        id, product_name, status, reject_reason,
        author:users!author_id(name),
        approver:users!approved_by(name),
        steps:tb_production_process_step(id, step_order, item, amount_g, note)
      `)
      .order("created_at", { ascending: false })

    processes = ((data ?? []) as unknown as ProcessFromDb[]).map((p) => ({
      ...p,
      steps: [...p.steps].sort((a, b) => a.step_order - b.step_order),
    }))
  } catch {
    // 테이블이 아직 생성되지 않은 경우 빈 상태로 진행
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">생산 공정 작성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          제품별 생산 공정 단계를 등록하고 편집합니다.
        </p>
      </div>

      <ProductionProcessForm initialProcesses={processes} isManager={isManager} />
    </div>
  )
}
