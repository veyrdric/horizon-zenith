'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export async function createStudentAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'No autenticado' };

    const adminCheck = await isAdmin(user);
    if (!adminCheck) return { error: 'Permisos insuficientes' };

    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;

    if (!email || !name || !password) {
      return { error: 'Faltan campos obligatorios' };
    }

    const supabaseAdmin = createAdminClient();

    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (authError) {
      console.error('Error creando usuario:', authError);
      return { error: authError.message };
    }

    if (authData.user) {
      // Insertamos respetando el nuevo esquema normalizado
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          name: name,
          objective: 'Sin objetivo definido',
          status_id: 1, // Asumimos que 1 es 'Activo'
          account_type_id: 2 // Estudiante
        });

      if (profileError) {
        console.error('Error creando perfil:', profileError);
        return { error: 'Usuario creado, pero hubo un error al crear su perfil.' };
      }
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Excepción en createStudentAction:', error);
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' };
  }
}
