'use client';

import React, { useState, useTransition } from 'react';
import { 
  IconSearch, 
  IconUserPlus, 
  IconUsersGroup,
  IconBook2,
  IconSettings,
  IconX,
  IconHexagonFilled,
  IconDeviceDesktopAnalytics
} from '@tabler/icons-react';
import { createStudentAction } from '@/lib/admin/actions';
import { logoutAction } from '@/lib/auth/actions';

export default function MentorDashboard({ serverStudents }: { serverStudents: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customToast, setCustomToast] = useState<{message: string, type: string} | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreateStudent = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createStudentAction(formData);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Alumno registrado con éxito.', 'success');
        setShowAddForm(false);
      }
    });
  };

  const showToast = (message: string, type = 'success') => {
    setCustomToast({ message, type });
    setTimeout(() => {
      setCustomToast(null);
    }, 4000);
  };

  const filteredStudents = serverStudents.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-surface-backdrop text-surface-dark font-sans relative pb-20">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-surface-light to-surface-backdrop pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

      {/* RECEPTOR DE TOASTS */}
      {customToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-surface-dark text-xs px-5 py-4 rounded-xl shadow-2xl max-w-xs md:max-w-sm">
          <div className="h-2 w-2 rotate-45 bg-brand shrink-0" />
          <span className="text-white font-sans font-black tracking-wider uppercase">{customToast.message}</span>
        </div>
      )}

      {/* MODAL: Alta de Nuevo Alumno */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-surface-dark/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative p-8">
            
            <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 text-text-muted hover:text-surface-dark transition-colors">
              <IconX size={24} stroke={2.5} />
            </button>

            <div className="mb-8 pr-8">
              <h1 className="text-3xl font-black text-surface-dark tracking-tight uppercase leading-none mb-2">
                Alta de Alumno
              </h1>
              <p className="text-xs font-bold text-text-muted tracking-widest uppercase">
                Creación de perfil y asignación de acceso
              </p>
            </div>

            <form action={handleCreateStudent} className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Nombre Completo</label>
                <div className="bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white">
                  <input type="text" name="name" required placeholder="Ej: John Doe" className="w-full bg-transparent px-4 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Correo Electrónico</label>
                <div className="bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white">
                  <input type="email" name="email" required placeholder="correo@ejemplo.com" className="w-full bg-transparent px-4 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-micro font-black uppercase tracking-widest text-surface-dark">Contraseña Temporal</label>
                <div className="bg-surface-light rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-brand focus-within:bg-white">
                  <input type="password" name="password" required minLength={6} placeholder="••••••••" className="w-full bg-transparent px-4 py-3.5 text-sm font-bold text-surface-dark placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-0 border-none" />
                </div>
              </div>
              
              <div className="pt-3">
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-surface-dark py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex justify-center items-center gap-3 shadow-sm cursor-pointer"
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
      )}

      {/* TOP FLOATING BAR */}
      <div className="pt-6 px-4 relative z-10 flex justify-center">
        <div className="w-full max-w-7xl bg-surface-dark rounded-2xl px-6 py-4 flex items-center justify-between shadow-island">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <IconHexagonFilled className="w-8 h-8 text-brand" />
              <div className="flex flex-col">
                <h1 className="text-white font-black tracking-widest uppercase text-lg leading-none">Horizon Zenith</h1>
                <span className="text-text-muted text-mini font-black tracking-[0.2em] uppercase mt-0.5">
                  Rhine Lab Core System
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-mini text-text-muted font-black uppercase tracking-widest">En Línea</span>
            </div>
            <form action={logoutAction}>
              <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-micro font-black uppercase tracking-widest transition-colors">
                Desconectar
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3 COLUMNS GRID LAYOUT */}
      {/* ============================================================== */}
      <div className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <div className="grid grid-cols-12 gap-6">
          
          {/* ============================================================== */}
          {/* COLUMNA 1: NAVBAR VERTICAL */}
          {/* ============================================================== */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3 flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl p-5 border border-transparent shadow-island">
              
              <div className="space-y-3">
                {/* ACTIVE BUTTON */}
                <button className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-150 relative bg-surface-dark text-white">
                  <div className="flex items-center gap-3">
                    <IconUsersGroup size={20} stroke={2} className="text-brand" />
                    <div>
                      <span className="text-[8px] text-text-muted block tracking-widest font-black uppercase">DIR_01</span>
                      <span className="text-xs font-black tracking-wide uppercase text-white">Directorio Estudiantil</span>
                    </div>
                  </div>
                </button>
                
                {/* INACTIVE BUTTON */}
                <button className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-150 relative text-surface-dark hover:bg-surface-light">
                  <div className="flex items-center gap-3">
                    <IconDeviceDesktopAnalytics size={20} stroke={2} className="text-text-muted" />
                    <div>
                      <span className="text-[8px] text-text-muted block tracking-widest font-black uppercase">SYS_02</span>
                      <span className="text-xs font-black tracking-wide uppercase text-surface-dark">Telemetría Global</span>
                    </div>
                  </div>
                </button>

                {/* INACTIVE BUTTON */}
                <button className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-150 relative text-surface-dark hover:bg-surface-light">
                  <div className="flex items-center gap-3">
                    <IconBook2 size={20} stroke={2} className="text-text-muted" />
                    <div>
                      <span className="text-[8px] text-text-muted block tracking-widest font-black uppercase">DOC_03</span>
                      <span className="text-xs font-black tracking-wide uppercase text-surface-dark">Biblioteca Académica</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* COLUMNA 2: CENTRAL (Buscador y Grilla) */}
          {/* ============================================================== */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
            
            {/* Buscador */}
            <div className="bg-white rounded-2xl p-4 border border-transparent flex flex-col sm:flex-row items-center gap-4 justify-between shadow-island">
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <IconSearch size={20} stroke={2.5} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar operador en la red..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-light rounded-xl pl-12 pr-4 py-3.5 text-xs font-bold text-surface-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                />
              </div>
            </div>

            {/* Grilla de Alumnos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStudents.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center text-text-muted font-bold text-xs uppercase tracking-widest shadow-island">
                  Base de datos sin registros.
                </div>
              ) : (
                filteredStudents.map((student) => {
                  let badgeColors = 'bg-surface-light text-text-muted';
                  if (student.status === 'Activo') {
                    badgeColors = 'bg-success/15 text-success';
                  } else if (student.status === 'Pausado') {
                    badgeColors = 'bg-brand/20 text-[#A58200]'; // A dark yellow/amber color
                  } else if (student.status === 'Finalizado') {
                    badgeColors = 'bg-error/10 text-error';
                  }
                  
                  return (
                    <div 
                      key={student.id}
                      className="bg-white rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[160px] transition-all border border-transparent hover:border-brand/50 group shadow-island"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-mini font-black px-2.5 py-1 rounded-md tracking-wider uppercase ${badgeColors}`}>
                            {student.status}
                          </span>
                          <span className="text-mini text-text-muted font-black tracking-wider bg-surface-light px-2 py-1 rounded uppercase">
                            UID: {student.id.split('-')[0]}
                          </span>
                        </div>
                        
                        <h3 className="font-extrabold text-surface-dark text-lg tracking-tight uppercase truncate mt-2">
                          {student.name || 'Operador'}
                        </h3>
                        <span className="text-micro font-bold tracking-widest text-text-muted mt-1 block truncate">
                          {student.email}
                        </span>
                      </div>

                      <div className="border-t border-surface-light mt-3 pt-3 flex items-center justify-between text-xs">
                        <span className="text-mini font-black tracking-widest text-surface-dark uppercase block truncate flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rotate-45 bg-brand" />
                          {student.role || 'Sin Clasificar'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* ============================================================== */}
          {/* COLUMNA 3: MÓDULOS (Herramientas Disponibles) */}
          {/* ============================================================== */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3 flex flex-col gap-6">
            
            <div className="bg-white rounded-2xl p-6 border border-transparent shadow-island">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-micro font-black tracking-widest text-text-muted uppercase">
                  Herramientas
                </span>
                <div className="h-[1px] flex-1 bg-surface-light" />
              </div>

              {/* Botones de Herramientas Estilo Grid Pequeño */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Añadir Estudiante */}
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-surface-light hover:bg-surface-dark hover:text-brand text-surface-dark rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 group border border-transparent"
                  title="Añadir Estudiante"
                >
                  <IconUserPlus size={26} stroke={2} />
                  <span className="text-mini font-black uppercase tracking-widest text-surface-dark group-hover:text-brand transition-colors">
                    AÑADIR
                  </span>
                </button>

                {/* Otros botones falsos de herramientas para hacer bulto */}
                <button 
                  className="bg-surface-light hover:bg-surface-dark hover:text-brand text-text-muted rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 group border border-transparent"
                  title="Configuración Global"
                >
                  <IconSettings size={26} stroke={2} />
                  <span className="text-mini font-black uppercase tracking-widest group-hover:text-brand transition-colors">
                    CONFIG
                  </span>
                </button>

                <button 
                  className="bg-surface-light hover:bg-surface-dark hover:text-brand text-text-muted rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 group border border-transparent"
                  title="Auditoría de Acceso"
                >
                  <IconSearch size={26} stroke={2} />
                  <span className="text-mini font-black uppercase tracking-widest group-hover:text-brand transition-colors">
                    BUSCAR
                  </span>
                </button>

              </div>
              
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
