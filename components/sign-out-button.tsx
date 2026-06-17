import { signOut } from "@/app/actions/auth"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        로그아웃
      </button>
    </form>
  )
}
