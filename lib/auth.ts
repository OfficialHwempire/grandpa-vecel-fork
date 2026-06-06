import "server-only"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"

export const AUTH_COOKIE = "app_session"

type User = { id: string; email: string; password: string }

// In-memory mockup stores. Reset whenever the server restarts.
const users = new Map<string, User>() // key: email
const sessions = new Map<string, string>() // key: sessionId -> userId

export type AuthResult = { error?: string }

export function registerUser(email: string, password: string): { error?: string; userId?: string } {
  const key = email.toLowerCase()
  if (users.has(key)) {
    return { error: "An account with this email already exists." }
  }
  const user: User = { id: randomUUID(), email: key, password }
  users.set(key, user)
  return { userId: user.id }
}

export function verifyUser(email: string, password: string): { error?: string; userId?: string } {
  const user = users.get(email.toLowerCase())
  if (!user || user.password !== password) {
    return { error: "Invalid email or password." }
  }
  return { userId: user.id }
}

export function createSession(userId: string): string {
  const sessionId = randomUUID()
  sessions.set(sessionId, userId)
  return sessionId
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId)
}

export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const store = await cookies()
  const sessionId = store.get(AUTH_COOKIE)?.value
  if (!sessionId) return null
  const userId = sessions.get(sessionId)
  if (!userId) return null
  for (const user of users.values()) {
    if (user.id === userId) return { id: user.id, email: user.email }
  }
  return null
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null
}
