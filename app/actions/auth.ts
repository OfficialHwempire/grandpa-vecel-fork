"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  AUTH_COOKIE,
  registerUser,
  verifyUser,
  createSession,
  destroySession,
} from "@/lib/auth"

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  }
}

export async function signIn(_prevState: { error?: string } | undefined, formData: FormData) {
  const { email, password } = readCredentials(formData)

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const { error, userId } = verifyUser(email, password)
  if (error || !userId) {
    return { error: error ?? "Unable to sign in." }
  }

  const sessionId = createSession(userId)
  const store = await cookies()
  store.set(AUTH_COOKIE, sessionId, sessionCookieOptions)

  redirect("/dashboard")
}

export async function register(_prevState: { error?: string } | undefined, formData: FormData) {
  const { email, password } = readCredentials(formData)

  if (!email || !password) {
    return { error: "Email and password are required." }
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }

  const { error, userId } = registerUser(email, password)
  if (error || !userId) {
    return { error: error ?? "Unable to register." }
  }

  const sessionId = createSession(userId)
  const store = await cookies()
  store.set(AUTH_COOKIE, sessionId, sessionCookieOptions)

  redirect("/dashboard")
}

export async function signOut() {
  const store = await cookies()
  const sessionId = store.get(AUTH_COOKIE)?.value
  if (sessionId) destroySession(sessionId)
  store.delete(AUTH_COOKIE)
  redirect("/login")
}
