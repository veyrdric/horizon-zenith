import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LibraryDashboardClient from '@/components/dashboard/library/LibraryDashboardClient';

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Fetch materials
  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error && error.code !== '42P01') { // 42P01 is relation does not exist, just in case
    console.error('Error fetching materials:', error);
  }

  return <LibraryDashboardClient materials={materials || []} />;
}
