import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewMaterialClient from '@/components/dashboard/library/NewMaterialClient';

export default async function NewMaterialPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return <NewMaterialClient />;
}
