'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  IconSearchFilled, 
  IconFolderFilled,
  IconBookFilled,
  IconSettingsFilled,
  IconHexagonFilled,
  IconDeviceDesktopFilled,
  IconPlus,
  IconFileText,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { logoutAction } from '@/lib/auth/actions';
import { deleteMaterialAction } from '@/lib/admin/actions';

export default function LibraryDashboardClient({ materials }: { materials: any[] }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<{id: string, title: string} | null>(null);
  
  const filteredMaterials = materials.filter(m => {
    const term = searchQuery.toLowerCase();
    const matchTitle = m.title.toLowerCase().includes(term);
    const matchTag = m.tags && m.tags.some((t: string) => t.toLowerCase().includes(term));
    return matchTitle || matchTag;
  });

  const confirmDelete = async () => {
    if (!materialToDelete) return;
    
    setIsDeleting(materialToDelete.id);
    const res = await deleteMaterialAction(materialToDelete.id);
    if (res.error) {
      alert(res.error);
    }
    setIsDeleting(null);
    setMaterialToDelete(null);
  };

  return (
    <div className="min-h-screen bg-surface-backdrop text-surface-dark font-sans relative pb-20">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-surface-light to-surface-backdrop pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

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

      {/* 3 COLUMNS GRID LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 mt-8 relative z-10">
        <div className="grid grid-cols-12 gap-6">
          
          {/* COLUMNA 1: NAVBAR VERTICAL */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3 flex flex-col gap-4">
            
            <div className="bg-white rounded-2xl p-5 border border-transparent shadow-island">
              
              <div className="space-y-3">
                {/* INACTIVE BUTTON -> DIRECTORIO */}
                <Link href="/admin" className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-150 relative text-surface-dark hover:bg-surface-light group">
                  <div className="flex items-center gap-3">
                    <IconFolderFilled size={20} className="text-text-muted group-hover:text-brand transition-colors" />
                    <div>
                      <span className="text-[8px] text-text-muted block tracking-widest font-black uppercase">DIR_01</span>
                      <span className="text-xs font-black tracking-wide uppercase text-surface-dark">Directorio Estudiantil</span>
                    </div>
                  </div>
                </Link>
                
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

                {/* ACTIVE BUTTON -> BIBLIOTECA */}
                <button className="w-full text-left p-4 rounded-xl flex items-center justify-between transition-all duration-150 relative bg-surface-dark text-white shadow-md">
                  <div className="flex items-center gap-3">
                    <IconBookFilled size={20} className="text-brand" />
                    <div>
                      <span className="text-[8px] text-text-muted block tracking-widest font-black uppercase">DOC_03</span>
                      <span className="text-xs font-black tracking-wide uppercase text-white">Biblioteca Académica</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

          </div>

          {/* COLUMNA 2: CENTRAL (Buscador y Grilla) */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
            
            {/* Buscador */}
            <div className="bg-white rounded-2xl p-4 border border-transparent flex flex-col sm:flex-row items-center gap-4 justify-between shadow-island">
              <div className="relative w-full">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <IconSearchFilled size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por título o etiqueta (ej: bucle, javascript)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-light rounded-xl pl-12 pr-4 py-3.5 text-xs font-bold text-surface-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                />
              </div>
            </div>

            {/* Grilla de Materiales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredMaterials.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-island flex flex-col items-center justify-center gap-4 border border-transparent">
                  <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-2 text-text-muted">
                    <IconBookFilled size={32} />
                  </div>
                  <p className="text-text-muted font-bold text-sm uppercase tracking-widest">
                    No hay materiales en la biblioteca.
                  </p>
                  <Link 
                    href="/admin/library/new"
                    className="mt-2 bg-brand hover:bg-brand-hover text-surface-dark px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors shadow-sm inline-block"
                  >
                    Crear Material
                  </Link>
                </div>
              ) : (
                filteredMaterials.map((material) => (
                  <div 
                    key={material.id}
                    className="bg-surface-light rounded-2xl p-6 relative flex flex-col justify-between transition-colors duration-200 border border-transparent hover:bg-surface-dark group"
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-mini text-text-muted font-black tracking-wider bg-white group-hover:bg-white/10 group-hover:text-text-muted px-2.5 py-1 rounded-md uppercase transition-colors">
                          {new Date(material.created_at).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Link 
                            href={`/admin/library/${material.id}/edit`} 
                            className="p-1.5 rounded-md text-text-muted/50 hover:bg-white hover:text-surface-dark transition-colors" 
                            title="Editar documento"
                          >
                            <IconEdit size={16} />
                          </Link>
                          <button 
                            onClick={() => setMaterialToDelete({id: material.id, title: material.title})}
                            disabled={isDeleting === material.id}
                            className="p-1.5 rounded-md text-text-muted/50 hover:bg-error hover:text-white transition-colors" 
                            title="Eliminar documento"
                          >
                            {isDeleting === material.id ? (
                              <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            ) : (
                              <IconTrash size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-extrabold text-surface-dark text-lg tracking-tight uppercase line-clamp-2 group-hover:text-brand transition-colors duration-200 leading-tight">
                        {material.title}
                      </h3>

                      {/* Render Tags */}
                      {material.tags && material.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {material.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-black tracking-widest text-surface-dark/70 group-hover:text-brand uppercase bg-white/50 group-hover:bg-brand/10 px-2 py-0.5 rounded transition-colors">
                              {tag}
                            </span>
                          ))}
                          {material.tags.length > 3 && (
                            <span className="text-[9px] font-black tracking-widest text-text-muted uppercase">
                              +{material.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 mt-6">
                      <Link 
                        href={`/admin/library/${material.id}`}
                        className="block w-full text-center bg-white text-surface-dark group-hover:bg-brand group-hover:text-surface-dark px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors duration-200"
                      >
                        Abrir Documento
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* COLUMNA 3: MÓDULOS (Herramientas Disponibles) */}
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
                
                {/* Nuevo Material */}
                <Link 
                  href="/admin/library/new"
                  className="bg-surface-light hover:bg-surface-dark hover:text-brand text-surface-dark rounded-xl aspect-square flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 group border border-transparent"
                  title="Crear Material"
                >
                  <IconPlus size={26} stroke={3} />
                  <span className="text-mini font-black uppercase tracking-widest text-surface-dark group-hover:text-brand transition-colors">
                    NUEVO
                  </span>
                </Link>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-dark border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <IconTrash size={32} className="text-error" />
            </div>
            
            <h2 className="text-2xl font-black text-white text-center tracking-tight uppercase mb-2">
              ¿Eliminar Documento?
            </h2>
            <p className="text-text-muted text-center text-sm mb-8">
              Estás a punto de eliminar <span className="text-white font-bold">"{materialToDelete.title}"</span>. Esta acción no se puede deshacer y borrará el documento permanentemente.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMaterialToDelete(null)}
                disabled={isDeleting === materialToDelete.id}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting === materialToDelete.id}
                className="flex-1 bg-error hover:bg-red-500 text-white font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting === materialToDelete.id ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Borrando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
