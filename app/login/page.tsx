import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  if (await isAuthenticated()) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-balance">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your password to access the database dashboard.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
