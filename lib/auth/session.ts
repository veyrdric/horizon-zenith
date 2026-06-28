import { createClient } from '@/lib/supabase/server';

/**
 * Obtiene el usuario autenticado actual usando el cliente de SSR.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Determina si un usuario es administrador de forma determinista y segura.
 * NUNCA mira `profiles.role` para esto, confía 100% en el JWT (app_metadata).
 */
export function isAdmin(user: { app_metadata?: { is_admin?: boolean } } | null): boolean {
  if (!user) return false;
  return user.app_metadata?.is_admin === true;
}

/**
 * Obtiene el perfil público (ej: especialización, métricas) para la UI.
 * Este método no debe usarse para decisiones críticas de autorización.
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
