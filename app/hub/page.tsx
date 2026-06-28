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

  // Comprobación de seguridad: Si es admin, no debería estar aquí
  if (isAdmin(user)) {
    redirect('/admin');
  }

  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-surface-light text-[#1E202B] font-sans antialiased p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera Test */}
        <div className="bg-surface-dark text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-4 -translate-y-4">
            <div className="h-32 w-32 rounded-full border-4 border-dashed border-brand" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-micro bg-brand/20 text-brand font-black px-3 py-1 rounded uppercase tracking-widest">
                Espacio de Trabajo Operativo
              </span>
              <h1 className="text-4xl font-black mt-4 uppercase tracking-tight">Portal del Alumno</h1>
              <p className="text-neutral-400 font-bold uppercase tracking-wider text-xs mt-2">
                Sesión autenticada correctamente
              </p>
            </div>
            <form action={logoutAction}>
              <button 
                type="submit"
                className="bg-error/15 hover:bg-error/30 text-error border border-error/30 px-6 py-2.5 rounded-lg text-micro font-black uppercase tracking-widest transition-colors"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>

        {/* Datos de Telemetría */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-border-light/30">
          <h2 className="text-xs font-black uppercase tracking-widest text-surface-dark mb-6 border-b border-surface-light pb-4">
            Telemetría del Perfil
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <span className="text-micro text-neutral-400 font-black uppercase tracking-widest block">ID de Operador (Auth)</span>
                <span className="text-sm font-mono font-bold text-surface-dark">{user.id}</span>
              </div>
              <div>
                <span className="text-micro text-neutral-400 font-black uppercase tracking-widest block">Email de Contacto</span>
                <span className="text-sm font-bold text-surface-dark">{user.email}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-micro text-neutral-400 font-black uppercase tracking-widest block">Nombre Registrado (Profile)</span>
                <span className="text-sm font-bold text-surface-dark">{profile?.name || 'No definido'}</span>
              </div>
              <div>
                <span className="text-micro text-neutral-400 font-black uppercase tracking-widest block">Especialización / Rol</span>
                <span className="text-sm font-bold text-surface-dark uppercase">{profile?.role || 'Ninguno'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
