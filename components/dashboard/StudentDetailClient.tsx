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
  IconVideoFilled
} from '@tabler/icons-react';

export default function StudentDetailClient({ studentData }: { studentData: any }) {
  const [activeTab, setActiveTab] = useState('resumen');
  
  const { profile, classes, challenges, doubts } = studentData;
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
            <div className="animate-fade-in bg-white p-6 rounded-2xl shadow-island">
              {classes.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-3 text-text-muted">
                    <IconBookFilled size={24} />
                  </div>
                  <p className="text-text-muted text-xs font-black tracking-widest uppercase">No hay clases registradas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map((cls: any) => (
                    <div key={cls.id} className="border-2 border-surface-light rounded-xl p-4 hover:border-brand/50 transition-colors flex justify-between items-center group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-light group-hover:bg-brand/10 group-hover:text-brand flex items-center justify-center text-text-muted transition-colors font-black">
                          {cls.class_number}
                        </div>
                        <div>
                          <span className="text-brand font-black text-[10px] tracking-widest uppercase block">Clase {cls.class_number}</span>
                          <h4 className="text-surface-dark font-black text-sm uppercase tracking-tight">{cls.title}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-text-muted flex items-center gap-1.5 bg-surface-light px-2.5 py-1 rounded-md">
                          <IconCalendarFilled size={14}/> {cls.date}
                        </span>
                      </div>
                    </div>
                  ))}
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
