import Link from "next/link"
import { redirect } from "next/navigation"
import { getTables } from "@/lib/supabase/db"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { SignOutButton } from "@/components/sign-out-button"
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

  // 현재 유저의 직책 확인
  const { data: userData } = await admin
    .from("users")
    .select("positions(name_ko)")
    .eq("id", user.id)
    .single()

  const positionName = (userData?.positions as { name_ko: string } | null)?.name_ko ?? ""
  const isManager = positionName === "점장"

  let tables: { name: string }[] = []
  try {
    tables = await getTables()
  } catch {
    // sidebar renders without table list
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          Dashboard
        </Link>
        <SignOutButton />
      </header>

      <div className="flex flex-1">
        <DashboardSidebar tables={tables} isManager={isManager} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
