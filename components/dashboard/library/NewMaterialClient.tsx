'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  IconChevronLeft, 
  IconDeviceFloppy
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import rehypeSanitize from 'rehype-sanitize';
import { createMaterialAction } from '@/lib/admin/actions';
import { createClient } from '@/lib/supabase/client';
import TagSelector from './TagSelector';

// Next.js requires dynamic import for this editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

export default function NewMaterialClient() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !value.trim()) return;
    
    setIsSaving(true);
    const res = await createMaterialAction({ title, content: value, tags });
    if (!res.error) {
      router.push('/admin/library');
    } else {
      alert(res.error);
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Insertar texto de carga (sin ! para evitar el error de src vacío)
    const loadingText = `\n*[Subiendo imagen...]*\n`;
    const tempValue = value.substring(0, start) + loadingText + value.substring(end);
    setValue(tempValue);

    // Subir a Supabase
    const supabase = createClient();
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('materials')
      .upload(fileName, file);

    if (error) {
      console.error('Error al subir:', error);
      setValue(value); // revertir si falla
      return;
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;
    const imageMarkdown = `![Imagen adjunta](${imageUrl})\n`;
    
    // Reemplazar texto de carga con la imagen real
    setValue((prev: string) => prev.replace(loadingText, imageMarkdown));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleImageUpload(file);
          break;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    
    let hasImage = false;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        e.preventDefault();
        handleImageUpload(files[i]);
        hasImage = true;
        break;
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-surface-dark text-white font-sans flex flex-col h-screen overflow-hidden"
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Top Bar */}
      <div className="py-4 min-h-[80px] border-b border-white/10 flex items-center justify-between px-6 bg-surface-dark shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/admin/library" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
            <IconChevronLeft size={20} stroke={3} />
          </Link>
          <div className="flex flex-col gap-2 w-full max-w-2xl">
            <input 
              type="text" 
              placeholder="Título del Material (Ej: Bucle For en JS)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none text-xl font-black uppercase tracking-tight focus:outline-none focus:ring-0 placeholder:text-text-muted/50 w-full p-0"
            />
            <TagSelector selectedTags={tags} onChange={setTags} />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/admin/library')}
            className="text-text-muted hover:text-white px-4 py-2 font-black text-xs tracking-widest uppercase transition-colors"
          >
            Descartar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-surface-dark px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-island"
          >
            {isSaving ? (
              <div className="w-4 h-4 rounded-full border-2 border-surface-dark border-t-transparent animate-spin" />
            ) : (
              <IconDeviceFloppy size={16} />
            )}
            Guardar
          </button>
        </div>
      </div>

      {/* Editor Space */}
      <div className="flex-1 bg-surface-dark min-h-0" data-color-mode="dark">
        <MDEditor
          value={value}
          onChange={(val) => setValue(val || '')}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
          height="100%"
          className="!border-none !rounded-none !bg-surface-dark !shadow-none"
        />
      </div>
    </div>
  );
}
