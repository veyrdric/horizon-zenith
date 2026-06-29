import { getCurrentUser, getCurrentProfile, isAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/lib/auth/actions';

export const metadata = {
  title: 'Hub - Horizon Zenith',
};

export default async function HubPage() {
  const user = await getCurrentUser();
  
  // Protección de ruta (esto también está reforzado por middleware)
  if (!user) {
    redirect('/login');
  }

  if (await isAdmin(user)) {
    redirect('/admin');
  }

  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-surface-backdrop text-surface-dark font-sans antialiased relative overflow-x-hidden pb-16 transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(var(--color-surface-dark)_1.5px,transparent_1.5px)] [background-size:18px_18px]" />

      {/* --- CABECERA --- */}
      <div className="bg-surface-dark text-text-muted py-3.5 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
            </span>
            <p className="text-xs font-black tracking-widest text-white uppercase">
              HORIZON ZENITH // PLATAFORMA DE OPERACIONES
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-surface-dark-elevated p-1.5 rounded-xl">
            <span className="px-4 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all duration-150 bg-brand text-surface-dark shadow-sm uppercase">
              PORTAL DEL ALUMNO
            </span>
            <form action={logoutAction}>
              <button type="submit" className="px-4 py-2 text-[10px] font-black tracking-widest text-error hover:text-white transition-colors uppercase">
                DESCONECTAR
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl p-12 text-center shadow-island">
          <h2 className="text-2xl font-black uppercase tracking-widest text-surface-dark mb-4">Bienvenido, {profile?.name || user.email}</h2>
          <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Tu espacio de trabajo está siendo calibrado.</p>
        </div>
      </div>
    </div>
  );
}
