import { createBrowserClient } from '@supabase/ssr'

// Usar en Client Components ('use client'). Se ejecuta en el navegador,
// solo puede usar la publishable/anon key (nunca la service_role key).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
