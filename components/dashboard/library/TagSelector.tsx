'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconX, IconPlus } from '@tabler/icons-react';
import { getTagsAction, createTagAction } from '@/lib/admin/actions';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchTags() {
      const res = await getTagsAction();
      if (res.data) setExistingTags(res.data);
      setIsLoading(false);
    }
    fetchTags();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const handleCreateTag = async () => {
    const normalized = inputValue.trim().toLowerCase();
    if (!normalized || selectedTags.includes(normalized)) return;

    // Add it optimistically
    onChange([...selectedTags, normalized]);
    setInputValue('');
    setIsOpen(false);
    
    // Save to DB
    const res = await createTagAction(normalized);
    if (res.success && res.name && !existingTags.includes(res.name)) {
      setExistingTags([...existingTags, res.name].sort());
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(t => t !== tagToRemove));
  };

  const filteredTags = existingTags.filter(t => 
    t.includes(inputValue.toLowerCase()) && !selectedTags.includes(t)
  );

  const exactMatch = existingTags.some(t => t === inputValue.trim().toLowerCase());
  const showCreateOption = inputValue.trim().length > 0 && !exactMatch && !selectedTags.includes(inputValue.trim().toLowerCase());

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex flex-wrap items-center gap-2 min-h-[40px] px-3 py-2 bg-black/20 rounded-xl border border-white/10 focus-within:border-brand/50 transition-colors">
        {selectedTags.map(tag => (
          <span 
            key={tag} 
            className="flex items-center gap-1 text-[10px] font-black tracking-widest text-brand uppercase bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-md"
          >
            {tag}
            <button 
              onClick={() => removeTag(tag)}
              className="hover:text-white transition-colors p-0.5 rounded-full hover:bg-brand/20"
            >
              <IconX size={12} stroke={3} />
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (showCreateOption) {
                handleCreateTag();
              } else if (filteredTags.length > 0) {
                handleSelectTag(filteredTags[0]);
              }
            } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
              removeTag(selectedTags[selectedTags.length - 1]);
            }
          }}
          placeholder={selectedTags.length === 0 ? "Buscar o crear etiquetas..." : ""}
          className="flex-1 bg-transparent border-none text-xs font-bold text-white focus:outline-none focus:ring-0 placeholder:text-text-muted/50 min-w-[120px]"
        />
      </div>

      {isOpen && (inputValue.length > 0 || filteredTags.length > 0) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-surface-dark border border-white/10 rounded-xl shadow-island max-h-48 overflow-y-auto py-1">
          {isLoading ? (
            <div className="px-4 py-2 text-xs text-text-muted">Cargando...</div>
          ) : (
            <>
              {filteredTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleSelectTag(tag)}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  {tag}
                </button>
              ))}
              
              {showCreateOption && (
                <button
                  onClick={handleCreateTag}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-brand hover:bg-brand/10 transition-colors flex items-center gap-2 border-t border-white/5"
                >
                  <IconPlus size={14} stroke={3} />
                  Crear etiqueta "{inputValue.trim().toLowerCase()}"
                </button>
              )}

              {filteredTags.length === 0 && !showCreateOption && (
                <div className="px-4 py-2 text-xs text-text-muted italic">No hay más etiquetas</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
