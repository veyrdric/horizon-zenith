'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  IconSearchFilled, 
  IconFolderFilled,
  IconBookFilled,
  IconSettingsFilled,
  IconX,
  IconHexagonFilled,
  IconDeviceDesktopFilled,
  IconFilterFilled,
  IconUserFilled,
  IconMailFilled,
  IconBriefcaseFilled,
  IconAwardFilled,
  IconFlagFilled,
  IconVideoFilled,
  IconBrandGithubFilled
} from '@tabler/icons-react';
import { createStudentAction } from '@/lib/admin/actions';
import { logoutAction } from '@/lib/auth/actions';
import AddStudentModal from './AddStudentModal';

export default function MentorDashboard({ 
  serverStudents,
  metadata
}: { 
  serverStudents: any[],
  metadata: { specializations: any[], programTypes: any[] }
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [customToast, setCustomToast] = useState<{message: string, type: string} | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSuccess = (msg: string, id?: string) => {
    showToast(msg, 'success');
    setShowAddForm(false);
    if (id) {
      router.push(`/admin/student/${id}`);
    }
  };

  const handleError = (msg: string) => {
    showToast(msg, 'error');
  };

  const showToast = (message: string, type = 'success') => {
    setCustomToast({ message, type });
    setTimeout(() => {
      setCustomToast(null);
    }, 4000);
  };

  // 1. Sort descending by default
  const sortedStudents = [...serverStudents].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 2. Filter by search and status
  const filteredStudents = sortedStudents.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 3. Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

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
      <AddStudentModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        metadata={metadata}
        onSuccess={handleSuccess}
        onError={handleError}
      />

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
                    <IconFolderFilled size={20} className="text-brand" />
                    <div>
                      <span className="text-[8px] text-text-muted block tracking-widest font-black uppercase">DIR_01</span>
                      <span className="text-xs font-black tracking-wide uppercase text-white">Directorio Estudiantil</span>
                    </div>
                  </div>
                </button>
                
                {/* INACTIVE BUTTON */}
                <button className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-150 relative text-surface-dark hover:bg-surface-light">
                  <div className="flex items-center gap-3">
                    <IconDeviceDesktopFilled size={20} className="text-text-muted" />
                    <div>
                      <span className="text-[8px] text-text-muted block tracking-widest font-black uppercase">SYS_02</span>
                      <span className="text-xs font-black tracking-wide uppercase text-surface-dark">Telemetría Global</span>
                    </div>
                  </div>
                </button>

                {/* INACTIVE BUTTON */}
                <button className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-150 relative text-surface-dark hover:bg-surface-light">
                  <div className="flex items-center gap-3">
                    <IconBookFilled size={20} className="text-text-muted" />
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
            
            {/* Buscador y Filtros */}
            <div className="bg-white rounded-2xl p-4 border border-transparent flex flex-col sm:flex-row items-center gap-4 justify-between shadow-island">
              <div className="relative w-full sm:flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <IconSearchFilled size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar operador por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-surface-light rounded-xl pl-12 pr-4 py-3.5 text-xs font-bold text-surface-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                />
              </div>
              <div className="relative w-full sm:w-auto shrink-0">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <IconFilterFilled size={18} />
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-48 appearance-none bg-surface-light rounded-xl pl-10 pr-10 py-3.5 text-xs font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all uppercase tracking-widest cursor-pointer"
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-[5px] border-transparent border-t-text-muted mt-1.5"></div>
              </div>
            </div>

            {/* Grilla de Alumnos (Cards estilo Dashboard) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {paginatedStudents.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-island flex flex-col items-center justify-center gap-4 border border-transparent">
                  <p className="text-text-muted font-bold text-sm uppercase tracking-widest">Todavía no tenés alumnos registrados o no coinciden con la búsqueda.</p>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-brand hover:bg-brand-hover text-surface-dark px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-sm"
                  >
                    Nuevo Alumno
                  </button>
                </div>
              ) : (
                paginatedStudents.map((student) => {
                  let badgeColors = 'bg-surface-light text-text-muted';
                  if (student.status === 'Activo') {
                    badgeColors = 'bg-success/15 text-success';
                  } else if (student.status === 'Pausado') {
                    badgeColors = 'bg-brand/20 text-[#A58200]';
                  } else if (student.status === 'Finalizado') {
                    badgeColors = 'bg-error/10 text-error';
                  }
                  return (
                    <div 
                      key={student.id}
                      className="bg-surface-light rounded-2xl p-6 relative flex flex-col justify-between transition-colors duration-200 border border-transparent hover:bg-surface-dark group"
                    >
                      <div className="relative z-10">
                        {/* Cabecera Tarjeta: Status y Fecha */}
                        <div className="flex justify-between items-start mb-4">
                          <span className={`text-mini font-black px-2.5 py-1 rounded-md tracking-wider uppercase ${badgeColors} transition-colors`}>
                            {student.status}
                          </span>
                          <span className="text-mini text-text-muted font-black tracking-wider bg-white group-hover:bg-white/10 group-hover:text-text-muted px-2.5 py-1 rounded-md uppercase transition-colors">
                            {new Date(student.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Nombre y Email */}
                        <h3 className="font-extrabold text-surface-dark text-xl tracking-tight uppercase truncate mt-2 group-hover:text-brand transition-colors duration-200">
                          {student.name || 'Operador'}
                        </h3>
                        <span className="text-xs font-bold tracking-widest text-text-muted mt-1 block truncate">
                          {student.email}
                        </span>
                      </div>

                      {/* Info extra (Rol y Programa) */}
                      <div className="relative z-10 mt-6 space-y-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-micro font-black tracking-widest text-text-muted uppercase">Especialización</span>
                          <span className="text-sm font-bold text-surface-dark group-hover:text-white uppercase truncate transition-colors duration-200">
                            {student.role || 'Sin Clasificar'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-micro font-black tracking-widest text-text-muted uppercase">Programa</span>
                          <span className="text-sm font-bold text-surface-dark group-hover:text-white uppercase truncate transition-colors duration-200">
                            {student.program_type || 'Sin Programa'}
                          </span>
                        </div>
                      </div>

                      {/* Acción */}
                      <div className="relative z-10 mt-8">
                        <Link 
                          href={`/admin/student/${student.id}`}
                          className="block w-full text-center bg-white text-surface-dark group-hover:bg-brand group-hover:text-surface-dark px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors duration-200"
                        >
                          Abrir Expediente
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Paginación (Si aplica) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl bg-white shadow-island text-xs font-black tracking-widest uppercase text-surface-dark disabled:opacity-50 hover:bg-surface-light transition-colors"
                >
                  Anterior
                </button>
                <span className="text-xs font-bold text-text-muted">Página {currentPage} de {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl bg-white shadow-island text-xs font-black tracking-widest uppercase text-surface-dark disabled:opacity-50 hover:bg-surface-light transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}

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
                  <IconUserFilled size={26} />
                  <span className="text-mini font-black uppercase tracking-widest text-surface-dark group-hover:text-brand transition-colors">
                    AÑADIR
                  </span>
                </button>

                {/* Otros botones falsos de herramientas para hacer bulto */}
                <button 
                  className="bg-surface-light hover:bg-surface-dark hover:text-brand text-text-muted rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 group border border-transparent"
                  title="Configuración Global"
                >
                  <IconSettingsFilled size={26} />
                  <span className="text-mini font-black uppercase tracking-widest group-hover:text-brand transition-colors">
                    CONFIG
                  </span>
                </button>

                <button 
                  className="bg-surface-light hover:bg-surface-dark hover:text-brand text-text-muted rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 group border border-transparent"
                  title="Auditoría de Acceso"
                >
                  <IconSearchFilled size={26} />
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
