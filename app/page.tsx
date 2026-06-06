import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"

export default async function Page() {
  redirect((await isAuthenticated()) ? "/dashboard" : "/login")
}
