'use client';

import React, { useTransition, useEffect } from 'react';
import { 
  IconUserFilled, 
  IconMailFilled, 
  IconBriefcaseFilled, 
  IconAwardFilled, 
  IconFlagFilled, 
  IconVideoFilled, 
  IconBrandGithubFilled,
  IconX 
} from '@tabler/icons-react';
import { createStudentAction } from '@/lib/admin/actions';

export default function AddStudentModal({
  isOpen,
  onClose,
  metadata,
  onSuccess,
  onError
}: {
  isOpen: boolean;
  onClose: () => void;
  metadata: { specializations: any[], programTypes: any[] };
  onSuccess: (message: string, studentId?: string) => void;
  onError: (message: string) => void;
}) {
  const [isPending, startTransition] = useTransition();

  // Bloquear el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateStudent = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createStudentAction(formData);
      if (result.error) {
        onError(result.error);
      } else {
        onSuccess('Alumno registrado con éxito.', result.newStudentId);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-surface-dark/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl relative p-8">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-text-muted hover:text-surface-dark transition-colors bg-surface-light hover:bg-surface-light/80 p-2 rounded-full z-10">
          <IconX size={20} stroke={2.5} />
        </button>

        <div className="mb-6 border-b border-surface-light pb-6 pr-8">
          <h1 className="text-2xl font-black text-surface-dark tracking-tight uppercase leading-none mb-2 flex items-center gap-3">
            <IconUserFilled className="text-brand" size={28} />
            Alta de Alumno
          </h1>
          <p className="text-xs font-bold text-text-muted tracking-widest uppercase">
            Completa los datos del nuevo operador para generar su expediente y credenciales.
          </p>
        </div>

        <form action={handleCreateStudent} className="flex flex-col gap-6 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
          
          {/* Sección: Datos Personales */}
          <div className="bg-surface-light/30 rounded-xl p-5 border border-surface-light">
            <h3 className="text-micro font-black tracking-widest text-text-muted uppercase mb-4">Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Nombre Completo <span className="text-error">*</span></label>
                <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3">
                  <IconUserFilled className="text-text-muted w-5 h-5 shrink-0" />
                  <input type="text" name="name" required placeholder="Ej: John Doe" className="w-full bg-transparent px-3 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Correo Electrónico <span className="text-error">*</span></label>
                <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3">
                  <IconMailFilled className="text-text-muted w-5 h-5 shrink-0" />
                  <input type="email" name="email" required placeholder="correo@ejemplo.com" className="w-full bg-transparent px-3 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Asignación Académica */}
          <div className="bg-surface-light/30 rounded-xl p-5 border border-surface-light">
            <h3 className="text-micro font-black tracking-widest text-text-muted uppercase mb-4">Asignación Académica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Especialización <span className="text-error">*</span></label>
                <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3 pr-2">
                  <IconBriefcaseFilled className="text-text-muted w-5 h-5 shrink-0" />
                  <select name="specialization_id" required className="w-full bg-transparent pl-3 pr-8 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-0 border-none appearance-none cursor-pointer">
                    <option value="">Seleccionar rol...</option>
                    {metadata.specializations.map(spec => (
                      <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Programa <span className="text-error">*</span></label>
                <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3 pr-2">
                  <IconAwardFilled className="text-text-muted w-5 h-5 shrink-0" />
                  <select name="program_type_id" required className="w-full bg-transparent pl-3 pr-8 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-0 border-none appearance-none cursor-pointer">
                    <option value="">Seleccionar programa...</option>
                    {metadata.programTypes.map(prog => (
                      <option key={prog.id} value={prog.id}>{prog.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 space-y-1.5 mt-2">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Objetivo Principal <span className="text-error">*</span></label>
                <div className="flex items-start bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3 pt-3.5">
                  <IconFlagFilled className="text-text-muted w-5 h-5 mt-0.5 shrink-0" />
                  <textarea name="objective" required placeholder="¿Qué busca lograr el operador? (Metas, intereses, área a profundizar...)" rows={2} className="w-full bg-transparent px-3 pb-3 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none resize-none"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Enlaces Adicionales */}
          <div className="bg-surface-light/30 rounded-xl p-5 border border-surface-light">
            <h3 className="text-micro font-black tracking-widest text-text-muted uppercase mb-4 flex items-center gap-2">
              Enlaces Adicionales <span className="text-[9px] bg-surface-light border border-border-light text-text-muted px-1.5 py-0.5 rounded">OPCIONALES</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Sala de Meet</label>
                <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3">
                  <IconVideoFilled className="text-text-muted w-5 h-5 shrink-0" />
                  <input type="url" name="meet_link" placeholder="https://meet.google.com/..." className="w-full bg-transparent px-3 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Repositorio GitHub</label>
                <div className="flex items-center bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white border border-transparent focus-within:border-brand/20 pl-3">
                  <IconBrandGithubFilled className="text-text-muted w-5 h-5 shrink-0" />
                  <input type="url" name="github_repo" placeholder="Automático si está vacío" className="w-full bg-transparent px-3 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 sticky bottom-0 bg-white pb-2 flex justify-end gap-3 border-t border-surface-light">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-text-muted hover:text-surface-dark hover:bg-surface-light transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-surface-dark px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-brand/20"
            >
              {isPending ? (
                <div className="w-4 h-4 rounded-full border-2 border-surface-dark border-t-transparent animate-spin" />
              ) : null}
              {isPending ? 'PROCESANDO...' : 'CONFIRMAR ALTA'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
