import { createAdminClient } from '@/lib/supabase/server';

export type StudentData = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string;
  created_at: string;
  last_sign_in_at?: string;
};

export async function getAllStudents(): Promise<StudentData[]> {
  const supabase = createAdminClient();
  
  // 1. Fetch all users from Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return [];
  }
  
  // 2. Fetch all profiles, joining with specializations and status
  // Using explicit joins for normalized schema
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      *,
      specializations ( name ),
      profile_statuses ( name )
    `);
    
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  }
  
  // 3. Filter out mentors (account_type_id == 1)
  const studentUsers = authData.users.filter(user => {
    const profile = profiles?.find(p => p.id === user.id);
    return profile?.account_type_id !== 1;
  });
  
  // 4. Merge Auth data and Profile data
  return studentUsers.map(user => {
    const profile = profiles?.find(p => p.id === user.id);
    // Extraemos el nombre de la especialización de la relación, si existe
    const roleName = profile?.specializations?.name || 'Sin Especialización';
    const statusName = profile?.profile_statuses?.name || 'Desconocido';
    
    return {
      id: user.id,
      email: user.email || 'Sin email',
      name: profile?.name || 'Operador Desconocido',
      role: roleName,
      status: statusName,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    };
  });
}
