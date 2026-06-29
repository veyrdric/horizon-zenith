import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import EditMaterialClient from '@/components/dashboard/library/EditMaterialClient';

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { data: material } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .single();

  if (!material) {
    notFound();
  }

  return <EditMaterialClient material={material} />;
}
