'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  IconChevronLeft, 
  IconUserFilled, 
  IconBriefcaseFilled, 
  IconAwardFilled, 
  IconFlagFilled, 
  IconVideoFilled, 
  IconBrandGithubFilled,
  IconShieldFilled,
  IconLockFilled,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconSquareRoundedXFilled,
  IconCheck
} from '@tabler/icons-react';
import { updateStudentAction, updateStudentStatusAction } from '@/lib/admin/actions';

export default function EditStudentClient({ studentData, metadata }: { studentData: any, metadata: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  
  const [customToast, setCustomToast] = useState<{message: string, type: string} | null>(null);

  const { profile } = studentData;
  const { specializations, programTypes, profileStatuses } = metadata;

  const currentStatusId = profile.status_id;
  const statusName = profile.profile_statuses?.name || 'Desconocido';

  const showToast = (message: string, type = 'success') => {
    setCustomToast({ message, type });
    setTimeout(() => {
      setCustomToast(null);
    }, 4000);
  };

  const handleUpdateStudent = (formData: FormData) => {
    startTransition(async () => {
      formData.append('id', profile.id);
      const result = await updateStudentAction(formData);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Perfil actualizado correctamente', 'success');
        setTimeout(() => {
          router.push(`/admin/student/${profile.id}`);
        }, 1500);
      }
    });
  };

  const handleStatusChange = (newStatusId: number) => {
    startStatusTransition(async () => {
      const formData = new FormData();
      formData.append('id', profile.id);
      formData.append('status_id', newStatusId.toString());
      
      const result = await updateStudentStatusAction(formData);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Estado de acceso actualizado', 'success');
      }
    });
  };

  return (
    <div className="min-h-screen bg-surface-backdrop text-surface-dark font-sans relative pb-20">
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-surface-light to-surface-backdrop pointer-events-none" />

      {/* RECEPTOR DE TOASTS */}
      {customToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-surface-dark text-xs px-5 py-4 rounded-xl shadow-2xl max-w-xs md:max-w-sm animate-fade-in">
          <div className={`h-2 w-2 rotate-45 shrink-0 ${customToast.type === 'error' ? 'bg-error' : 'bg-brand'}`} />
          <span className="text-white font-sans font-black tracking-wider uppercase">{customToast.message}</span>
        </div>
      )}

      {/* HEADER / BACK */}
      <div className="pt-6 px-4 relative z-10 flex justify-center">
        <div className="w-full max-w-7xl bg-surface-dark rounded-2xl px-6 py-4 flex items-center justify-between shadow-island">
          <div className="flex items-center gap-4">
            <Link href={`/admin/student/${profile.id}`} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
              <IconChevronLeft size={20} stroke={3} />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-white font-black tracking-widest uppercase text-lg leading-none">Configuración de Operador</h1>
              <span className="text-text-muted text-mini font-black tracking-[0.2em] uppercase mt-0.5">
                Expediente: {profile.id.split('-')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA 1: FORMULARIO PRINCIPAL */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-island">
              <div className="mb-8 border-b border-surface-light pb-6">
                <h2 className="text-xl font-black text-surface-dark tracking-tight uppercase flex items-center gap-3">
                  <IconUserFilled className="text-brand" size={24} />
                  Modificar Perfil
                </h2>
                <p className="text-xs font-bold text-text-muted tracking-widest uppercase mt-2">
                  Los cambios se reflejarán inmediatamente en todo el sistema.
                </p>
              </div>

              <form action={handleUpdateStudent} className="flex flex-col gap-8">
                
                {/* NO EDITABLE */}
                <div className="bg-surface-backdrop/50 rounded-xl p-5 border border-surface-light/50">
                  <h3 className="text-micro font-black tracking-widest text-text-muted uppercase mb-4 flex items-center gap-2">
                    <IconLockFilled size={14} /> Credenciales (Solo Lectura)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-micro font-black uppercase tracking-widest text-text-muted">ID Sistema</label>
                      <input type="text" disabled value={profile.id} className="w-full bg-surface-light px-3 py-3 text-sm font-bold text-text-muted rounded-xl cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-micro font-black uppercase tracking-widest text-text-muted">Correo Electrónico</label>
                      <input type="text" disabled value={profile.email} className="w-full bg-surface-light px-3 py-3 text-sm font-bold text-text-muted rounded-xl cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                {/* DATOS EDITABLES */}
                <div className="space-y-1.5">
                  <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Nombre Completo <span className="text-error">*</span></label>
                  <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3">
                    <IconUserFilled className="text-text-muted w-5 h-5 shrink-0" />
                    <input type="text" name="name" defaultValue={profile.name} required className="w-full bg-transparent px-3 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted focus:outline-none border-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Especialización <span className="text-error">*</span></label>
                    <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3 pr-2">
                      <IconBriefcaseFilled className="text-text-muted w-5 h-5 shrink-0" />
                      <select name="specialization_id" defaultValue={profile.specialization_id} required className="w-full bg-transparent pl-3 pr-8 py-3.5 text-sm font-bold text-surface-dark focus:outline-none border-none appearance-none cursor-pointer">
                        {specializations.map((spec: any) => (
                          <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Programa <span className="text-error">*</span></label>
                    <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3 pr-2">
                      <IconAwardFilled className="text-text-muted w-5 h-5 shrink-0" />
                      <select name="program_type_id" defaultValue={profile.program_type_id} required className="w-full bg-transparent pl-3 pr-8 py-3.5 text-sm font-bold text-surface-dark focus:outline-none border-none appearance-none cursor-pointer">
                        {programTypes.map((prog: any) => (
                          <option key={prog.id} value={prog.id}>{prog.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Objetivo Principal <span className="text-error">*</span></label>
                  <div className="flex items-start bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3 pt-3.5">
                    <IconFlagFilled className="text-text-muted w-5 h-5 mt-0.5 shrink-0" />
                    <textarea name="objective" defaultValue={profile.objective} required rows={3} className="w-full bg-transparent px-3 pb-3 text-sm font-bold text-surface-dark placeholder:text-text-muted focus:outline-none border-none resize-none"></textarea>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Sala de Meet</label>
                    <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3">
                      <IconVideoFilled className="text-text-muted w-5 h-5 shrink-0" />
                      <input type="url" name="meet_link" defaultValue={profile.meet_link || ''} className="w-full bg-transparent px-3 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted focus:outline-none border-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Repositorio GitHub</label>
                    <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3">
                      <IconBrandGithubFilled className="text-text-muted w-5 h-5 shrink-0" />
                      <input type="url" name="github_repo" defaultValue={profile.github_repo || ''} className="w-full bg-transparent px-3 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted focus:outline-none border-none" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-light flex justify-end gap-4">
                  <Link href={`/admin/student/${profile.id}`} className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-text-muted hover:text-surface-dark hover:bg-surface-light transition-colors">
                    Descartar
                  </Link>
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="bg-surface-dark text-white hover:bg-black disabled:opacity-50 px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-island"
                  >
                    {isPending ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <IconCheck size={16} />}
                    {isPending ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* COLUMNA 2: ACCESO Y ESTADO */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-island sticky top-8">
              <div className="mb-6 border-b border-surface-light pb-6">
                <h2 className="text-xl font-black text-surface-dark tracking-tight uppercase flex items-center gap-3">
                  <IconShieldFilled className="text-brand" size={24} />
                  Control de Acceso
                </h2>
                <p className="text-xs font-bold text-text-muted tracking-widest uppercase mt-2">
                  Modifica los permisos de red del operador.
                </p>
              </div>

              <div className="mb-8">
                <span className="text-micro font-black tracking-widest uppercase block text-text-muted mb-2">Estado Actual</span>
                <div className="inline-block px-4 py-2 rounded-xl text-sm font-black tracking-widest uppercase bg-surface-dark text-white shadow-sm">
                  {statusName}
                </div>
              </div>

              <div className="space-y-4">
                {currentStatusId !== 1 && (
                  <button 
                    onClick={() => handleStatusChange(1)} // Activo
                    disabled={statusPending}
                    className="w-full bg-success/15 hover:bg-success hover:text-white text-success px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-between group border border-transparent shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <IconPlayerPlayFilled size={18} />
                      Activar Operador
                    </div>
                  </button>
                )}

                {currentStatusId !== 2 && (
                  <button 
                    onClick={() => handleStatusChange(2)} // Pausado
                    disabled={statusPending}
                    className="w-full bg-surface-light hover:bg-[#A58200] hover:text-white text-[#A58200] px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-between group border border-transparent shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <IconPlayerPauseFilled size={18} />
                      Pausar Acceso
                    </div>
                  </button>
                )}

                {currentStatusId !== 3 && (
                  <button 
                    onClick={() => handleStatusChange(3)} // Finalizado
                    disabled={statusPending}
                    className="w-full bg-error/10 hover:bg-error hover:text-white text-error px-5 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-between group border border-transparent shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <IconSquareRoundedXFilled size={18} />
                      Finalizar Programa
                    </div>
                  </button>
                )}
              </div>
              
              <div className="mt-8 p-4 bg-surface-backdrop/50 rounded-xl border border-surface-light text-xs font-bold text-text-muted leading-relaxed">
                <strong className="text-surface-dark block mb-1">Nota del sistema:</strong>
                Cambiar el estado repercute en el acceso del operador al Hub. Si pausas o finalizas, no podrán interactuar con sus expedientes.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
