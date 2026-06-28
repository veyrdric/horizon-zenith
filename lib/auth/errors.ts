import type { AuthErrorData } from './types';

/**
 * Mapea errores nativos de Supabase a objetos seguros para serialización.
 * - Evita devolver clases (Error) desde Server Actions para que React no falle al hidratar.
 * - Enmascara los mensajes técnicos evitando la enumeración de usuarios.
 */
export function mapSupabaseError(error: any): AuthErrorData {
  const msg = error?.message?.toLowerCase() || '';
  
  if (msg.includes('invalid login credentials')) {
    return { 
      code: 'invalid_credentials', 
      message: 'Email o contraseña incorrectos.' // Mensaje genérico forzado
    };
  }
  
  if (msg.includes('rate limit')) {
    return { 
      code: 'rate_limited', 
      message: 'Demasiados intentos. Por favor, intenta de nuevo más tarde.' 
    };
  }

  // Log interno para poder debuggear errores inesperados (404, CORS, etc) sin exponerlos al cliente.
  console.error('[Supabase Auth Error]:', error);

  return { 
    code: 'unknown', 
    message: 'Ocurrió un error inesperado al intentar iniciar sesión.' 
  };
}
