'use server'

import { createClient } from '@/lib/supabase/server';
import { loginSchema } from './schemas';
import { mapSupabaseError } from './errors';
import { AuthResult } from './types';
import { isAdmin } from './session';

/**
 * Procesa el inicio de sesión.
 * - Validación Zod (errores de campos granulares)
 * - Anti-fuerza bruta (stubbed)
 * - Supabase Auth
 * - Mapeo de errores seguro para serialización
 * - Retorna discriminador (sin ejecutar next/navigation redirect internamente)
 */
export async function loginAction(
  prevState: AuthResult | null, 
  formData: FormData
): Promise<AuthResult> {
  // 1. TODO: Rate Limiting
  // Aquí se debe integrar Upstash/Ratelimit u otra heurística (basada en headers IP
  // desde next/headers) para evitar ataques de fuerza bruta.
  // if (rateLimitHit) return { ok: false, error: { code: 'rate_limited', message: '...' } };

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // 2. Validación Tipada con Zod
  const validationResult = loginSchema.safeParse({ email, password });
  
  if (!validationResult.success) {
    return { 
      ok: false, 
      error: { code: 'validation_error', message: 'Revisa los campos ingresados.' },
      fieldErrors: validationResult.error.flatten().fieldErrors 
    };
  }

  const { email: validEmail, password: validPassword } = validationResult.data;
  const supabase = await createClient();

  // 3. Supabase Auth Call
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validEmail,
    password: validPassword,
  });

  // 4. Mapeo de Error Controlado
  if (error) {
    return { ok: false, error: mapSupabaseError(error) };
  }

  // 5. Decisión de Ruteo Post-Login
  const redirectTo = isAdmin(data.user) ? '/admin' : '/hub';

  return { ok: true, redirectTo };
}

import { redirect } from 'next/navigation';

/**
 * Cierra la sesión activa actual en el backend y limpia cookies de Supabase SSR.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
