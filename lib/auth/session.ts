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
 * Determina si un usuario es administrador verificando su relación en la tabla profiles.
 */
export async function isAdmin(user: any): Promise<boolean> {
  if (!user) return false;
  
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Soporta diferentes nomenclaturas comunes para la foreign key
  return profile?.account_type_id === 1 || profile?.account_type === 1 || profile?.account_types_id === 1;
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
