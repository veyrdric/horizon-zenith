import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/lib/auth/actions';

export const metadata = {
  title: 'Consola Rhine Lab - Horizon Zenith',
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  // Protección de ruta
  if (!user) {
    redirect('/login');
  }

  // Comprobación de seguridad ESTRICTA: Si no tiene el claim de admin, afuera.
  if (!isAdmin(user)) {
    redirect('/hub'); // Un alumno intentando entrar a admin se va a su hub
  }

  return (
    <div className="min-h-screen bg-surface-dark text-white font-sans antialiased p-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ECEEF2_1.5px,transparent_1.5px)] [background-size:18px_18px]" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Cabecera Admin Test */}
        <div className="bg-surface-dark-elevated p-8 rounded-xl shadow-lg border border-border-dark relative overflow-hidden">
          <div className="absolute left-0 bottom-0 w-2 h-full bg-brand" />
          
          <div className="flex justify-between items-start pl-4">
            <div>
              <span className="text-micro bg-brand/10 text-brand font-black px-3 py-1 rounded uppercase tracking-widest">
                Acceso de Alto Nivel Concedido
              </span>
              <h1 className="text-4xl font-black mt-4 uppercase tracking-tight text-surface-light">Consola del Mentor</h1>
              <p className="text-brand font-bold uppercase tracking-wider text-xs mt-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                Modo Administrador (service_role) Activo
              </p>
            </div>
            
            <form action={logoutAction}>
              <button 
                type="submit"
                className="bg-surface-dark hover:bg-[#0A0A0E] text-neutral-400 hover:text-white border border-border-dark px-6 py-2.5 rounded-lg text-micro font-black uppercase tracking-widest transition-all"
              >
                Cerrar Sesión Segura
              </button>
            </form>
          </div>
        </div>

        {/* Datos Administrativos */}
        <div className="bg-surface-dark-elevated p-8 rounded-xl shadow-sm border border-border-dark">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-6 border-b border-border-dark pb-4">
            Credenciales de Autoridad
          </h2>
          
          <div className="space-y-6">
            <div className="bg-surface-dark p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-micro text-neutral-500 font-black uppercase tracking-widest block mb-1">ID de Administrador</span>
                <span className="text-sm font-mono font-bold text-brand">{user.id}</span>
              </div>
              <div className="text-right">
                <span className="text-micro text-neutral-500 font-black uppercase tracking-widest block mb-1">Email Registrado</span>
                <span className="text-sm font-bold text-white">{user.email}</span>
              </div>
            </div>

            <div className="bg-success/10 border border-success/20 p-4 rounded-lg">
              <p className="text-xs text-success font-bold uppercase tracking-wide leading-relaxed">
                El sistema reconoció correctamente el claim <code className="font-mono bg-success/20 px-1 py-0.5 rounded">is_admin: true</code> dentro de app_metadata proveniente del JWT de Supabase. A partir de aquí puedes utilizar la Consola que diseñamos para gestionar a los N alumnos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
