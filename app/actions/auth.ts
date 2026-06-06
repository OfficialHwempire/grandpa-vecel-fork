"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_COOKIE, checkPassword } from "@/lib/auth"

export async function signIn(_prevState: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "")

  if (!checkPassword(password)) {
    return { error: "Incorrect password. Please try again." }
  }

  const store = await cookies()
  store.set(AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  redirect("/dashboard")
}

export async function signOut() {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
  redirect("/login")
}
