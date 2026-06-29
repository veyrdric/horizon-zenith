'use client';

import React from 'react';
import Link from 'next/link';
import { 
  IconChevronLeft, 
  IconEdit,
  IconBookFilled
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import rehypeSanitize from 'rehype-sanitize';

// Require dynamic import for the markdown preview
const MarkdownPreview = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
);

export default function MaterialDetailClient({ material }: { material: any }) {
  return (
    <div className="min-h-screen bg-surface-backdrop text-surface-dark font-sans relative pb-20">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-surface-light to-surface-backdrop pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

      {/* TOP FLOATING BAR */}
      <div className="pt-6 px-4 relative z-10 flex justify-center">
        <div className="w-full max-w-5xl bg-surface-dark rounded-2xl px-6 py-4 flex items-center justify-between shadow-island">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/library"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              <IconChevronLeft size={20} stroke={3} />
            </Link>
            <div className="flex items-center gap-3">
              <IconBookFilled className="w-6 h-6 text-brand" />
              <div className="flex flex-col">
                <h1 className="text-white font-black tracking-widest uppercase text-sm leading-none line-clamp-1">{material.title}</h1>
                <span className="text-text-muted text-mini font-black tracking-[0.2em] uppercase mt-0.5">
                  Biblioteca Académica
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href={`/admin/library/${material.id}/edit`}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-micro font-black uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              <IconEdit size={16} />
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENIDO DEL DOCUMENTO */}
      <div className="max-w-4xl mx-auto px-4 mt-8 relative z-10">
        <div className="bg-surface-dark rounded-3xl p-8 md:p-12 shadow-island border border-white/5 min-h-[60vh]" data-color-mode="dark">
          
          <div className="mb-10 pb-10 border-b border-white/10">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase leading-none mb-6">
              {material.title}
            </h1>
            
            {/* Etiquetas (Tags) */}
            {material.tags && material.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {material.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="text-[10px] font-black tracking-widest text-brand uppercase bg-brand/10 border border-brand/20 px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Renderizador de Markdown */}
          <div className="wmde-markdown-var" data-color-mode="dark">
             <MarkdownPreview 
               source={material.content} 
               rehypePlugins={[[rehypeSanitize]]} 
               style={{ backgroundColor: 'transparent', color: '#ffffff' }}
             />
          </div>
        </div>
      </div>
    </div>
  );
}
