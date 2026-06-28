import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Usar en Server Components, Server Actions y Route Handlers.
// Respeta RLS como el usuario autenticado (no es admin).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Se puede ignorar si se llama desde un Server Component:
            // el middleware ya se encarga de refrescar la sesión.
          }
        },
      },
    }
  )
}

// Cliente ADMIN: usa la service_role key, ignora RLS por completo.
// SOLO usar dentro de Route Handlers / Server Actions / Edge Functions
// que vos controlás (la consola del mentor, webhooks de Stripe/GitHub).
// NUNCA exponer la service_role key al navegador ni importar este
// archivo desde un Client Component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
