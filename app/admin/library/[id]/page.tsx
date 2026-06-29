import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import MaterialDetailClient from '@/components/dashboard/library/MaterialDetailClient';

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  return <MaterialDetailClient material={material} />;
}
