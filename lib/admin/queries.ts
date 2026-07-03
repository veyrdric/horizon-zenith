import { createAdminClient } from '@/lib/supabase/server';

export type StudentData = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string;
  program_type: string;
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
      profile_statuses ( name ),
      program_types ( name )
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
    const programName = profile?.program_types?.name || 'Sin Programa';
    
    return {
      id: user.id,
      email: user.email || 'Sin email',
      name: profile?.name || 'Operador Desconocido',
      role: roleName,
      status: statusName,
      program_type: programName,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    };
  });
}

export async function getStudentById(id: string) {
  const supabase = createAdminClient();
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      *,
      specializations ( name ),
      profile_statuses ( name ),
      program_types ( name ),
      account_types ( name )
    `)
    .eq('id', id)
    .single();

  if (profileError) {
    console.error('Error fetching student profile:', profileError);
    return null;
  }
  
  const { data: authData, error: authError } = await supabase.auth.admin.getUserById(id);

  if (authError || !authData.user) {
    console.error('Error fetching user auth data:', authError);
    return null;
  }

  // Traer las relaciones
  const { data: packages } = await supabase.from('packages').select('*').eq('student_id', id).order('created_at', { ascending: false });
  const { data: classes } = await supabase.from('classes').select('*, class_materials(material_id)').eq('student_id', id).order('class_number', { ascending: true });
  const { data: challenges } = await supabase.from('challenges').select('*').eq('student_id', id).order('id', { ascending: true });
  const { data: doubts } = await supabase.from('doubts').select('*').eq('student_id', id).order('created_at', { ascending: false });

  return {
    profile: {
      ...profile,
      email: authData.user.email || 'Sin email',
      created_at: authData.user.created_at,
      last_sign_in_at: authData.user.last_sign_in_at,
    },
    packages: packages || [],
    classes: classes || [],
    challenges: challenges || [],
    doubts: doubts || [],
  };
}

export async function getMetadata() {
  const supabase = createAdminClient();
  const { data: specializations } = await supabase.from('specializations').select('*').order('id');
  const { data: programTypes } = await supabase.from('program_types').select('*').order('id');
  const { data: profileStatuses } = await supabase.from('profile_statuses').select('*').order('id');
  
  return {
    specializations: specializations || [],
    programTypes: programTypes || [],
    profileStatuses: profileStatuses || []
  };
}
