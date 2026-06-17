import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const admin = createAdminClient()

  const { data: userData } = await admin
    .from("users")
    .select("name, positions(name_ko)")
    .eq("id", user.id)
    .single()

  const positionName = (userData?.positions as { name_ko: string } | null)?.name_ko ?? ""
  const isManager = positionName === "점장"
  const userName = userData?.name ?? user.email?.split("@")[0] ?? "사용자"

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <DashboardSidebar isManager={isManager} userName={userName} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
