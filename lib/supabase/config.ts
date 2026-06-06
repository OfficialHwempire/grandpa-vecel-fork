// The Supabase project URL is public (it's in every client request).
// The anon key and service role key remain in environment variables.
// We fall back to the known project URL if the env var is missing or invalid,
// because it has been entered incorrectly in the environment.
const FALLBACK_SUPABASE_URL = "https://ytjhpwsyldxlgolgevnt.supabase.co"

function isValidUrl(value: string | undefined): value is string {
  if (!value) return false
  try {
    const u = new URL(value)
    return u.protocol === "https:" && u.hostname.endsWith("supabase.co")
  } catch {
    return false
  }
}

export const SUPABASE_URL = isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
  ? process.env.NEXT_PUBLIC_SUPABASE_URL
  : FALLBACK_SUPABASE_URL

export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
