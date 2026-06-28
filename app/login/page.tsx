import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import LoginForm from './login-form';

export const metadata = {
  title: 'Acceso - Horizon Zenith',
};

export default async function LoginPage() {
  // Verificación de sesión inicial en el lado del servidor.
  // Si el usuario ya está autenticado, lo derivamos a su área correspondiente.
  const user = await getCurrentUser();
  if (user) {
    redirect(isAdmin(user) ? '/admin' : '/hub');
  }

  // Si no está autenticado, servimos el Client Component del formulario.
  return <LoginForm />;
}
