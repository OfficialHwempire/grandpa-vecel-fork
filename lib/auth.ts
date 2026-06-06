import "server-only"
import { cookies } from "next/headers"

export const AUTH_COOKIE = "app_auth"

// Simple shared password gate. No roles or permissions.
// Set APP_PASSWORD in your environment; falls back to "admin" for local use.
const APP_PASSWORD = process.env.APP_PASSWORD ?? "admin"

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return store.get(AUTH_COOKIE)?.value === "1"
}

export function checkPassword(password: string): boolean {
  return password === APP_PASSWORD
}
