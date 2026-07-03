'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  IconChevronLeft, 
  IconUserFilled, 
  IconBookFilled, 
  IconFlagFilled, 
  IconMessageFilled,
  IconHexagonFilled,
  IconCalendarFilled,
  IconSettingsFilled,
  IconBrandGithubFilled,
  IconVideoFilled,
  IconPlus,
  IconCheck,
  IconX
} from '@tabler/icons-react';

export default function StudentDetailClient({ studentData, allMaterials = [] }: { studentData: any, allMaterials?: any[] }) {
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Modal states
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newPackageTitle, setNewPackageTitle] = useState('');
  const [newPackageTotal, setNewPackageTotal] = useState('');
  const [isCreatingPackage, setIsCreatingPackage] = useState(false);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassMaterialIds, setNewClassMaterialIds] = useState<string[]>([]);
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // Edit Class state
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassTitle, setEditClassTitle] = useState('');
  const [editClassDate, setEditClassDate] = useState('');
  const [editClassStatus, setEditClassStatus] = useState('pendiente');
  const [editClassDuration, setEditClassDuration] = useState('');
  const [editClassVideoUrl, setEditClassVideoUrl] = useState('');
  const [editClassDescription, setEditClassDescription] = useState('');
  const [editClassMaterialIds, setEditClassMaterialIds] = useState<string[]>([]);
  const [isUpdatingClass, setIsUpdatingClass] = useState(false);

  // Material Search state
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [isNewMaterialDropdownOpen, setIsNewMaterialDropdownOpen] = useState(false);
  const [isEditMaterialDropdownOpen, setIsEditMaterialDropdownOpen] = useState(false);

  const { profile, classes, challenges, doubts, packages = [] } = studentData;
  const statusName = profile.profile_statuses?.name || 'Desconocido';
  const roleName = profile.specializations?.name || 'Sin Especialización';
  
  let badgeColors = 'bg-surface-light text-text-muted border-transparent';
  if (statusName === 'Activo') badgeColors = 'bg-success/20 text-success border-success/30';
  else if (statusName === 'Pausado') badgeColors = 'bg-[#A58200]/20 text-[#A58200] border-[#A58200]/30';
  else if (statusName === 'Finalizado') badgeColors = 'bg-error/20 text-error border-error/30';

  return (
    <div className="min-h-screen bg-surface-backdrop text-surface-dark font-sans relative pb-20">
      
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-surface-light to-surface-backdrop pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

      {/* HEADER / BACK */}
      <div className="pt-6 px-4 relative z-10 flex justify-center">
        <div className="w-full max-w-7xl bg-surface-dark rounded-2xl px-6 py-4 flex items-center justify-between shadow-island">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
              <IconChevronLeft size={20} stroke={3} />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-white font-black tracking-widest uppercase text-lg leading-none">Expediente de Red</h1>
              <span className="text-text-muted text-mini font-black tracking-[0.2em] uppercase mt-0.5">
                {profile.id.split('-')[0]}
              </span>
            </div>
          </div>
          
          <Link href={`/admin/student/${profile.id}/edit`} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-micro font-black uppercase tracking-widest transition-colors flex items-center gap-2">
            <IconSettingsFilled size={16} />
            Configurar
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 relative z-10">
        
        {/* HERO CARD */}
        <div className="bg-surface-dark rounded-3xl p-6 lg:p-8 shadow-2xl mb-6 relative overflow-hidden border border-white/5">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
            
            {/* INFO */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`text-[10px] font-black px-3 py-1 rounded-md tracking-widest uppercase border ${badgeColors}`}>
                  {statusName}
                </span>
                <span className="text-[10px] font-black tracking-widest text-text-muted uppercase flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-md border border-white/5">
                  <IconHexagonFilled size={12} className="text-brand" />
                  {roleName}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-1 leading-none">
                {profile.name}
              </h2>
              <p className="text-sm font-bold tracking-widest text-text-muted flex items-center gap-2">
                {profile.email}
              </p>
            </div>
            
            {/* STATS */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex-1 md:flex-none backdrop-blur-sm min-w-[140px]">
                <span className="text-[9px] font-black tracking-[0.2em] text-text-muted uppercase block mb-1">
                  Última Conexión
                </span>
                <span className="text-sm font-bold text-white">
                  {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString() : 'Nunca'}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex-1 md:flex-none backdrop-blur-sm min-w-[140px]">
                <span className="text-[9px] font-black tracking-[0.2em] text-text-muted uppercase block mb-1">
                  Ingreso
                </span>
                <span className="text-sm font-bold text-white">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')} icon={<IconUserFilled size={16} />} label="Resumen" />
          <TabButton active={activeTab === 'clases'} onClick={() => setActiveTab('clases')} icon={<IconBookFilled size={16} />} label={`Clases (${classes.length})`} />
          <TabButton active={activeTab === 'desafios'} onClick={() => setActiveTab('desafios')} icon={<IconFlagFilled size={16} />} label={`Desafíos (${challenges.length})`} />
          <TabButton active={activeTab === 'dudas'} onClick={() => setActiveTab('dudas')} icon={<IconMessageFilled size={16} />} label={`Dudas (${doubts.length})`} />
        </div>

        {/* TAB CONTENTS */}
        <div className="min-h-[300px]">
          {activeTab === 'resumen' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
              
              {/* OBJECTIVE CARD */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-island border border-transparent">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
                    <IconFlagFilled size={20} />
                  </div>
                  <h3 className="text-sm font-black text-surface-dark tracking-widest uppercase">Objetivo Principal</h3>
                </div>
                <p className="text-surface-dark font-bold text-sm bg-surface-light p-4 rounded-xl border border-transparent">
                  {profile.objective}
                </p>
              </div>

              {/* LINKS CARD */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-island border border-transparent flex-1">
                   <div className="flex items-center gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-surface-light text-text-muted">
                      <IconVideoFilled size={20} />
                    </div>
                    <h3 className="text-sm font-black text-surface-dark tracking-widest uppercase">Sala de Meet</h3>
                  </div>
                  {profile.meet_link ? (
                    <a href={profile.meet_link} target="_blank" rel="noreferrer" className="block w-full text-center bg-surface-light hover:bg-surface-dark hover:text-white text-surface-dark py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-colors">
                      Unirse
                    </a>
                  ) : (
                    <div className="text-center bg-surface-light py-3 rounded-xl text-xs font-bold tracking-widest text-text-muted uppercase">
                      No configurado
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-island border border-transparent flex-1">
                   <div className="flex items-center gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-surface-light text-text-muted">
                      <IconBrandGithubFilled size={20} />
                    </div>
                    <h3 className="text-sm font-black text-surface-dark tracking-widest uppercase">Repositorio</h3>
                  </div>
                  {profile.github_repo ? (
                    <a href={profile.github_repo} target="_blank" rel="noreferrer" className="block w-full text-center bg-surface-light hover:bg-surface-dark hover:text-white text-surface-dark py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-colors">
                      Ver Repo
                    </a>
                  ) : (
                    <div className="text-center bg-surface-light py-3 rounded-xl text-xs font-bold tracking-widest text-text-muted uppercase">
                      No configurado
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'clases' && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-island border border-transparent">
                <div>
                  <h3 className="text-surface-dark font-black tracking-widest uppercase text-sm">Mentorías / Paquetes</h3>
                  <p className="text-text-muted text-xs font-bold mt-1 tracking-wider">Organiza las clases del alumno por paquetes adquiridos.</p>
                </div>
                <button 
                  onClick={() => setIsPackageModalOpen(true)}
                  className="bg-brand hover:bg-brand-hover text-surface-dark px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                >
                  Nuevo Paquete
                </button>
              </div>

              {packages.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-island border border-transparent">
                  <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                    <IconBookFilled size={32} />
                  </div>
                  <p className="text-text-muted text-sm font-black tracking-widest uppercase">El alumno no tiene paquetes activos.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {packages.map((pkg: any) => {
                    const pkgClasses = classes.filter((c: any) => c.package_id === pkg.id);
                    return (
                      <div key={pkg.id} className="bg-white rounded-2xl p-6 shadow-island border border-transparent relative overflow-hidden">
                        
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-surface-light relative z-10">
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-text-muted uppercase bg-surface-light px-3 py-1 rounded-md mb-3 inline-block">
                              {pkg.status}
                            </span>
                            <h4 className="text-surface-dark font-black text-xl tracking-tight uppercase">{pkg.title}</h4>
                            <p className="text-text-muted text-xs font-bold tracking-widest mt-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand" />
                              Progreso: {pkgClasses.length} / {pkg.total_classes} clases
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedPackageId(pkg.id);
                              setIsClassModalOpen(true);
                            }}
                            className="text-xs font-black text-surface-dark bg-surface-light border border-transparent px-5 py-2.5 rounded-xl hover:bg-surface-dark hover:text-white transition-all uppercase tracking-widest flex items-center gap-2"
                          >
                            <IconPlus size={16} /> Añadir Clase
                          </button>
                        </div>
                        
                        {pkgClasses.length === 0 ? (
                          <div className="bg-surface-light rounded-2xl p-6 text-center border border-transparent relative z-10">
                            <p className="text-text-muted text-xs font-bold tracking-widest uppercase">Aún no hay clases agendadas en este paquete.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 relative z-10">
                            {pkgClasses.map((cls: any) => (
                              <div 
                                key={cls.id} 
                                onClick={() => {
                                  setEditingClassId(cls.id);
                                  setEditClassTitle(cls.title);
                                  setEditClassDate(cls.date);
                                  setEditClassStatus(cls.status || 'pendiente');
                                  setEditClassDuration(cls.duration || '');
                                  setEditClassVideoUrl(cls.video_url || '');
                                  setEditClassDescription(cls.description || '');
                                  
                                  // Map material array from class_materials
                                  setEditClassMaterialIds(
                                    cls.class_materials ? cls.class_materials.map((m: any) => m.material_id) : []
                                  );
                                  setMaterialSearchQuery('');
                                  setIsEditClassModalOpen(true);
                                }}
                                className="border border-surface-light rounded-2xl p-4 hover:border-brand/50 transition-all flex flex-col md:flex-row md:justify-between md:items-center gap-4 group cursor-pointer bg-white"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-surface-light group-hover:bg-brand/10 group-hover:text-brand flex items-center justify-center text-text-muted transition-colors font-black text-lg flex-shrink-0">
                                    {cls.class_number}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-brand font-black text-[10px] tracking-widest uppercase block">Clase {cls.class_number}</span>
                                      <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${
                                        cls.status === 'concluida' ? 'bg-green-100 text-green-700' 
                                        : cls.status === 'cancelada' ? 'bg-red-100 text-red-700' 
                                        : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {cls.status || 'Pendiente'}
                                      </span>
                                    </div>
                                    <h4 className="text-surface-dark font-black text-sm uppercase tracking-tight leading-tight">{cls.title}</h4>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 self-end md:self-auto">
                                  {cls.video_url && (
                                    <span className="bg-brand/10 text-brand px-3 py-1.5 rounded-lg flex items-center justify-center">
                                      <IconVideoFilled size={14} />
                                    </span>
                                  )}
                                  <span className="text-[11px] font-bold text-text-muted flex items-center gap-1.5 bg-surface-light px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                    <IconCalendarFilled size={14}/> {cls.date}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Huérfanas (Clases antiguas sin paquete) */}
                  {classes.filter((c: any) => !c.package_id).length > 0 && (
                    <div className="bg-surface-light rounded-2xl p-6 opacity-70 mt-8">
                      <h4 className="text-surface-dark font-black text-sm tracking-widest uppercase mb-4 flex items-center gap-2">
                        <IconBookFilled size={16} className="text-text-muted" /> Clases sin paquete (Antiguas)
                      </h4>
                      <div className="space-y-3">
                        {classes.filter((c: any) => !c.package_id).map((cls: any) => (
                          <div key={cls.id} className="border border-transparent rounded-xl p-4 bg-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <h4 className="text-surface-dark font-black text-sm uppercase tracking-tight">{cls.title}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'desafios' && (
            <div className="animate-fade-in bg-white p-6 rounded-2xl shadow-island">
              {challenges.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-3 text-text-muted">
                    <IconFlagFilled size={24} />
                  </div>
                  <p className="text-text-muted text-xs font-black tracking-widest uppercase">No hay desafíos asignados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges.map((chal: any) => (
                    <div key={chal.id} className="border-2 border-surface-light rounded-xl p-5 hover:border-brand/50 transition-colors">
                      <span className="text-[10px] font-black tracking-widest uppercase bg-surface-dark text-white px-2 py-1 rounded mb-3 inline-block">
                        {chal.status}
                      </span>
                      <h4 className="text-surface-dark font-black text-sm uppercase tracking-tight leading-tight">{chal.title}</h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'dudas' && (
            <div className="animate-fade-in bg-white p-6 rounded-2xl shadow-island">
              {doubts.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-3 text-text-muted">
                    <IconMessageFilled size={24} />
                  </div>
                  <p className="text-text-muted text-xs font-black tracking-widest uppercase">No hay dudas registradas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doubts.map((doubt: any) => (
                    <div key={doubt.id} className="bg-surface-light rounded-xl p-5 border-2 border-transparent hover:border-brand/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded inline-block ${doubt.is_resolved ? 'bg-success/20 text-success border border-success/30' : 'bg-[#A58200]/20 text-[#A58200] border border-[#A58200]/30'}`}>
                          {doubt.is_resolved ? 'Resuelta' : 'Pendiente'}
                        </span>
                        <span className="text-xs font-bold text-text-muted">{new Date(doubt.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-surface-dark font-black text-sm uppercase tracking-tight mb-3">"{doubt.question}"</p>
                      {doubt.answer && (
                        <div className="bg-white p-4 rounded-lg border border-surface-light">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1 flex items-center gap-1.5">
                            <IconHexagonFilled size={10} className="text-brand"/>
                            Respuesta del Mentor
                          </span>
                          <p className="text-surface-dark text-xs font-medium">{doubt.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* CUSTOM MODAL FOR NEW PACKAGE */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-transparent rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-surface-dark text-center tracking-tight uppercase mb-2">
              Crear Nuevo Paquete
            </h2>
            <p className="text-text-muted text-center text-sm mb-8">
              Configura un bloque de clases para <span className="text-surface-dark font-bold">"{profile.name}"</span>.
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Nombre del Paquete</label>
                <input 
                  type="text"
                  value={newPackageTitle}
                  onChange={(e) => setNewPackageTitle(e.target.value)}
                  placeholder="Ej: 8 Clases de React JS"
                  className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Total de Clases</label>
                <input 
                  type="number"
                  min="1"
                  value={newPackageTotal}
                  onChange={(e) => setNewPackageTotal(e.target.value)}
                  placeholder="Ej: 8"
                  className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsPackageModalOpen(false)}
                disabled={isCreatingPackage}
                className="flex-1 bg-surface-light hover:bg-surface-dark hover:text-white text-surface-dark font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!newPackageTitle || !newPackageTotal || isNaN(Number(newPackageTotal))) {
                    alert('Por favor, completa todos los campos correctamente.');
                    return;
                  }
                  setIsCreatingPackage(true);
                  const { createPackageAction } = await import('@/lib/admin/actions');
                  const res = await createPackageAction(profile.id, newPackageTitle, Number(newPackageTotal));
                  setIsCreatingPackage(false);
                  
                  if (res.error) {
                    alert(res.error);
                  } else {
                    setIsPackageModalOpen(false);
                    setNewPackageTitle('');
                    setNewPackageTotal('');
                  }
                }}
                disabled={isCreatingPackage || !newPackageTitle || !newPackageTotal}
                className="flex-1 bg-brand hover:bg-brand-hover text-surface-dark font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingPackage ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-surface-dark/30 border-t-surface-dark animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM MODAL FOR NEW CLASS */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-transparent rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-surface-dark text-center tracking-tight uppercase mb-2">
              Agendar Clase
            </h2>
            <p className="text-text-muted text-center text-sm mb-8">
              Añade una nueva clase al paquete seleccionado.
            </p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Título de la Clase</label>
                <input 
                  type="text"
                  value={newClassTitle}
                  onChange={(e) => setNewClassTitle(e.target.value)}
                  placeholder="Ej: Introducción a React"
                  className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Fecha</label>
                <input 
                  type="date"
                  value={newClassDate}
                  onChange={(e) => setNewClassDate(e.target.value)}
                  className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all text-text-muted"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Material Vinculado (Opcional)</label>
                
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Buscar y añadir material..."
                    value={materialSearchQuery}
                    onChange={(e) => {
                      setMaterialSearchQuery(e.target.value);
                      setIsNewMaterialDropdownOpen(true);
                    }}
                    onFocus={() => setIsNewMaterialDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsNewMaterialDropdownOpen(false), 200)}
                    className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                  />
                  {isNewMaterialDropdownOpen && materialSearchQuery && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-surface-dark/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {allMaterials
                        .filter(m => m.title.toLowerCase().includes(materialSearchQuery.toLowerCase()) && !newClassMaterialIds.includes(m.id))
                        .map(mat => (
                        <div 
                          key={mat.id} 
                          className="px-4 py-3 hover:bg-surface-light cursor-pointer text-sm font-bold text-surface-dark transition-colors border-b border-surface-dark/5 last:border-0 truncate"
                          onClick={() => {
                             setNewClassMaterialIds([...newClassMaterialIds, mat.id]);
                             setMaterialSearchQuery('');
                             setIsNewMaterialDropdownOpen(false);
                          }}
                        >
                          {mat.title}
                        </div>
                      ))}
                      {allMaterials.filter(m => m.title.toLowerCase().includes(materialSearchQuery.toLowerCase()) && !newClassMaterialIds.includes(m.id)).length === 0 && (
                         <div className="px-4 py-3 text-sm text-text-muted font-bold text-center">No hay resultados.</div>
                      )}
                    </div>
                  )}
                </div>

                {newClassMaterialIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {newClassMaterialIds.map(id => {
                       const mat = allMaterials.find(m => m.id === id);
                       if (!mat) return null;
                       return (
                         <div key={id} className="flex items-center gap-2 bg-brand/20 border border-brand/30 text-surface-dark px-3 py-1.5 rounded-lg text-xs font-black max-w-[200px]">
                           <span className="truncate flex-1" title={mat.title}>{mat.title}</span>
                           <button 
                             onClick={() => setNewClassMaterialIds(newClassMaterialIds.filter(mId => mId !== id))}
                             className="hover:text-brand transition-colors flex-shrink-0"
                           >
                             <IconX size={14} stroke={3} />
                           </button>
                         </div>
                       )
                    })}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsClassModalOpen(false)}
                disabled={isCreatingClass}
                className="flex-1 bg-surface-light hover:bg-surface-dark hover:text-white text-surface-dark font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!newClassTitle || !newClassDate || !selectedPackageId) {
                    alert('Por favor, completa el título y la fecha.');
                    return;
                  }
                  setIsCreatingClass(true);
                  const { createClassAction } = await import('@/lib/admin/actions');
                  const res = await createClassAction(
                    profile.id, 
                    selectedPackageId, 
                    newClassTitle, 
                    newClassDate, 
                    newClassMaterialIds
                  );
                  setIsCreatingClass(false);
                  
                  if (res.error) {
                    alert(res.error);
                  } else {
                    setIsClassModalOpen(false);
                    setNewClassTitle('');
                    setNewClassDate('');
                    setNewClassMaterialIds([]);
                    setIsClassModalOpen(false);
                  }
                }}
                disabled={isCreatingClass || !newClassTitle || !newClassDate}
                className="flex-1 bg-brand hover:bg-brand-hover text-surface-dark font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingClass ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-surface-dark/30 border-t-surface-dark animate-spin" />
                    Agendando...
                  </>
                ) : (
                  'Agendar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM MODAL FOR EDITING CLASS */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-transparent rounded-3xl p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-surface-dark text-center tracking-tight uppercase mb-2">
              Editar Clase
            </h2>
            <p className="text-text-muted text-center text-sm mb-8">
              Modifica los detalles de la clase y sube grabaciones.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Título</label>
                  <input 
                    type="text"
                    value={editClassTitle}
                    onChange={(e) => setEditClassTitle(e.target.value)}
                    className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Fecha</label>
                  <input 
                    type="date"
                    value={editClassDate}
                    onChange={(e) => setEditClassDate(e.target.value)}
                    className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all text-text-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Estado</label>
                  <select 
                    value={editClassStatus}
                    onChange={(e) => setEditClassStatus(e.target.value)}
                    className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all appearance-none cursor-pointer"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="concluida">Concluida</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Duración (Horas)</label>
                  <input 
                    type="number"
                    step="0.5"
                    min="0"
                    value={editClassDuration}
                    onChange={(e) => setEditClassDuration(e.target.value)}
                    placeholder="Ej: 1.5"
                    className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Enlace de la Grabación (Video URL)</label>
                <input 
                  type="url"
                  value={editClassVideoUrl}
                  onChange={(e) => setEditClassVideoUrl(e.target.value)}
                  placeholder="https://zoom.us/..."
                  className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Material Vinculado</label>
                
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Buscar y añadir material..."
                    value={materialSearchQuery}
                    onChange={(e) => {
                      setMaterialSearchQuery(e.target.value);
                      setIsEditMaterialDropdownOpen(true);
                    }}
                    onFocus={() => setIsEditMaterialDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsEditMaterialDropdownOpen(false), 200)}
                    className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted"
                  />
                  {isEditMaterialDropdownOpen && materialSearchQuery && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-surface-dark/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {allMaterials
                        .filter(m => m.title.toLowerCase().includes(materialSearchQuery.toLowerCase()) && !editClassMaterialIds.includes(m.id))
                        .map(mat => (
                        <div 
                          key={mat.id} 
                          className="px-4 py-3 hover:bg-surface-light cursor-pointer text-sm font-bold text-surface-dark transition-colors border-b border-surface-dark/5 last:border-0 truncate"
                          onClick={() => {
                             setEditClassMaterialIds([...editClassMaterialIds, mat.id]);
                             setMaterialSearchQuery('');
                             setIsEditMaterialDropdownOpen(false);
                          }}
                        >
                          {mat.title}
                        </div>
                      ))}
                      {allMaterials.filter(m => m.title.toLowerCase().includes(materialSearchQuery.toLowerCase()) && !editClassMaterialIds.includes(m.id)).length === 0 && (
                         <div className="px-4 py-3 text-sm text-text-muted font-bold text-center">No hay resultados.</div>
                      )}
                    </div>
                  )}
                </div>

                {editClassMaterialIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editClassMaterialIds.map(id => {
                       const mat = allMaterials.find(m => m.id === id);
                       if (!mat) return null;
                       return (
                         <div key={id} className="flex items-center gap-2 bg-brand/20 border border-brand/30 text-surface-dark px-3 py-1.5 rounded-lg text-xs font-black max-w-[200px]">
                           <span className="truncate flex-1" title={mat.title}>{mat.title}</span>
                           <button 
                             onClick={() => setEditClassMaterialIds(editClassMaterialIds.filter(mId => mId !== id))}
                             className="hover:text-brand transition-colors flex-shrink-0"
                           >
                             <IconX size={14} stroke={3} />
                           </button>
                         </div>
                       )
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black text-surface-dark tracking-widest uppercase mb-2 block">Descripción / Notas</label>
                <textarea 
                  value={editClassDescription}
                  onChange={(e) => setEditClassDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-light border border-transparent rounded-xl px-4 py-3.5 text-sm font-bold text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand transition-all placeholder:text-text-muted resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditClassModalOpen(false)}
                disabled={isUpdatingClass}
                className="flex-1 bg-surface-light hover:bg-surface-dark hover:text-white text-surface-dark font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!editClassTitle || !editClassDate || !editingClassId) {
                    alert('Por favor, completa el título y la fecha.');
                    return;
                  }
                  setIsUpdatingClass(true);
                  const { updateClassAction } = await import('@/lib/admin/actions');
                  const res = await updateClassAction(
                    profile.id, 
                    editingClassId,
                    {
                      title: editClassTitle,
                      date: editClassDate,
                      status: editClassStatus,
                      duration: editClassDuration,
                      video_url: editClassVideoUrl,
                      description: editClassDescription,
                      materialIds: editClassMaterialIds
                    }
                  );
                  setIsUpdatingClass(false);
                  
                  if (res.error) {
                    alert(res.error);
                  } else {
                    setIsEditClassModalOpen(false);
                  }
                }}
                disabled={isUpdatingClass || !editClassTitle || !editClassDate}
                className="flex-1 bg-brand hover:bg-brand-hover text-surface-dark font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingClass ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-surface-dark/30 border-t-surface-dark animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 border border-transparent whitespace-nowrap
        ${active 
          ? 'bg-surface-dark text-brand shadow-md' 
          : 'bg-white text-text-muted hover:text-surface-dark hover:bg-surface-light shadow-island'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
