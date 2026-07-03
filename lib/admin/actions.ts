'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateStudentSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Formato de correo inválido"),
  specialization_id: z.coerce.number().min(1, "Especialización es requerida"),
  program_type_id: z.coerce.number().min(1, "Tipo de programa es requerido"),
  objective: z.string().min(5, "El objetivo es requerido"),
  meet_link: z.string().optional(),
  github_repo: z.string().optional(),
});

export async function createStudentAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'No autenticado' };

    const adminCheck = await isAdmin(user);
    if (!adminCheck) return { error: 'Permisos insuficientes' };

    // 1. Validate with Zod
    const validatedFields = CreateStudentSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      specialization_id: formData.get('specialization_id'),
      program_type_id: formData.get('program_type_id'),
      objective: formData.get('objective'),
      meet_link: formData.get('meet_link'),
      github_repo: formData.get('github_repo')
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0]?.message || 'Datos de formulario inválidos.' };
    }

    const data = validatedFields.data;
    const supabaseAdmin = createAdminClient();

    // Random temp password
    const tempPassword = crypto.randomUUID();

    // 2 & 3. Create user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: data.name }
    });

    if (authError) {
      console.error('Error creando usuario:', authError);
      // Clean error for duplicate email
      if (authError.message.includes('already registered') || authError.status === 422) {
        return { error: 'El correo electrónico ya está registrado en el sistema.' };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Error desconocido al crear el usuario en Auth.' };
    }

    const userId = authData.user.id;

    // 4. Insert into profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        name: data.name,
        objective: data.objective,
        status_id: 1, // 'Activo'
        account_type_id: 2, // 'Alumno'
        specialization_id: data.specialization_id,
        program_type_id: data.program_type_id,
        meet_link: data.meet_link || null,
        github_repo: data.github_repo || `https://github.com/horizon-zenith/${data.name.toLowerCase().replace(/\s+/g, '-')}`
      });

    // 5. Rollback if profile creation fails
    if (profileError) {
      console.error('Error creando perfil:', profileError);
      // Rollback manual
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: 'No se pudo crear el perfil. Operación revertida.' };
    }

    // 6. Revalidate and return success with ID for redirect
    revalidatePath('/admin');
    return { success: true, newStudentId: userId };
    
  } catch (error: any) {
    console.error('Excepción en createStudentAction:', error);
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' };
  }
}

const UpdateStudentSchema = z.object({
  id: z.string().uuid("ID inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  specialization_id: z.coerce.number().min(1, "Especialización es requerida"),
  program_type_id: z.coerce.number().min(1, "Tipo de programa es requerido"),
  objective: z.string().min(5, "El objetivo es requerido"),
  meet_link: z.string().optional(),
  github_repo: z.string().optional(),
});

export async function updateStudentAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'No autenticado' };

    const adminCheck = await isAdmin(user);
    if (!adminCheck) return { error: 'Permisos insuficientes' };

    const validatedFields = UpdateStudentSchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name'),
      specialization_id: formData.get('specialization_id'),
      program_type_id: formData.get('program_type_id'),
      objective: formData.get('objective'),
      meet_link: formData.get('meet_link'),
      github_repo: formData.get('github_repo')
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.issues[0]?.message || 'Datos de formulario inválidos.' };
    }

    const data = validatedFields.data;
    const supabaseAdmin = createAdminClient();

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        name: data.name,
        objective: data.objective,
        specialization_id: data.specialization_id,
        program_type_id: data.program_type_id,
        meet_link: data.meet_link || null,
        github_repo: data.github_repo || null
      })
      .eq('id', data.id);

    if (profileError) {
      console.error('Error actualizando perfil:', profileError);
      return { error: 'No se pudo actualizar el perfil.' };
    }

    revalidatePath(`/admin/student/${data.id}`);
    revalidatePath(`/admin/student/${data.id}/edit`);
    revalidatePath('/admin');
    return { success: true };
    
  } catch (error: any) {
    console.error('Excepción en updateStudentAction:', error);
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' };
  }
}

export async function updateStudentStatusAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: 'No autenticado' };

    const adminCheck = await isAdmin(user);
    if (!adminCheck) return { error: 'Permisos insuficientes' };

    const id = formData.get('id') as string;
    const status_id = parseInt(formData.get('status_id') as string);

    if (!id || isNaN(status_id)) {
      return { error: 'Datos inválidos.' };
    }

    const supabaseAdmin = createAdminClient();

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status_id })
      .eq('id', id);

    if (profileError) {
      console.error('Error actualizando estado:', profileError);
      return { error: 'No se pudo actualizar el estado.' };
    }

    // TODO: Enviar email automático si se pausa (Etapa futura)

    revalidatePath(`/admin/student/${id}`);
    revalidatePath(`/admin/student/${id}/edit`);
    revalidatePath('/admin');
    return { success: true };
    
  } catch (error: any) {
    console.error('Excepción en updateStudentStatusAction:', error);
    return { error: 'Ocurrió un error inesperado.' };
  }
}

export async function createMaterialAction(data: { title: string, content: string, tags?: string[] }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'No autorizado.' };
  }

  const { error } = await supabase
    .from('materials')
    .insert({
      title: data.title,
      content: data.content,
      tags: data.tags || []
    });

  if (error) {
    console.error('Error creating material:', error);
    return { error: 'Error al crear el material de estudio.' };
  }

  revalidatePath('/admin/library');
  return { success: true };
}

export async function updateMaterialAction(id: string, data: { title: string, content: string, tags?: string[] }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'No autorizado.' };
  }

  const { error } = await supabase
    .from('materials')
    .update({
      title: data.title,
      content: data.content,
      tags: data.tags || []
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating material:', error);
    return { error: 'Error al actualizar el material de estudio.' };
  }

  revalidatePath('/admin/library');
  revalidatePath(`/admin/library/${id}`);
  return { success: true };
}

export async function deleteMaterialAction(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'No autorizado.' };
  }

  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting material:', error);
    return { error: 'Error al eliminar el material' };
  }

  revalidatePath('/admin/library');
  return { success: true };
}

export async function getTagsAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Error fetching tags:', error);
    return { data: [], error: 'Error al obtener etiquetas' };
  }
  
  return { data: data.map(t => t.name) };
}

export async function createTagAction(name: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'No autorizado.' };
  }

  const normalized = name.trim().toLowerCase();
  
  const { error } = await supabase
    .from('tags')
    .insert({ name: normalized });
    
  if (error && error.code !== '23505') { // 23505 is unique violation
    console.error('Error creating tag:', error);
    return { error: 'Error al crear la etiqueta' };
  }
  
  return { success: true, name: normalized };
}

export async function createPackageAction(studentId: string, title: string, totalClasses: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const adminCheck = await isAdmin(user);
  if (!adminCheck) return { error: 'Permisos insuficientes' };

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from('packages')
    .insert({ 
      student_id: studentId, 
      title, 
      total_classes: totalClasses 
    });
    
  if (error) {
    console.error('Error creating package:', error);
    return { error: 'Error al crear el paquete' };
  }
  
  revalidatePath(`/admin/student/${studentId}`);
  return { success: true };
}

export async function createClassAction(
  studentId: string, 
  packageId: string, 
  title: string, 
  date: string, 
  materialIds?: string[] | null
) {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const adminCheck = await isAdmin(user);
  if (!adminCheck) return { error: 'Permisos insuficientes' };

  const supabaseAdmin = createAdminClient();

  // 1. Get current classes count for the package to assign class_number
  const { data: existingClasses, error: countError } = await supabaseAdmin
    .from('classes')
    .select('id')
    .eq('package_id', packageId);

  if (countError) {
    console.error('Error counting classes:', countError);
    return { error: 'Error al contar las clases' };
  }

  const nextClassNumber = (existingClasses?.length || 0) + 1;

  // 2. Insert the new class
  const { data: newClass, error: classError } = await supabaseAdmin
    .from('classes')
    .insert({
      student_id: studentId,
      package_id: packageId,
      title,
      date,
      class_number: nextClassNumber,
      duration: '1',
      description: 'Pendiente de descripción',
      video_url: ''
    })
    .select()
    .single();

  if (classError || !newClass) {
    console.error('Error creating class:', classError);
    return { error: 'Error al crear la clase' };
  }

  // 3. Link materials if provided
  if (materialIds && materialIds.length > 0) {
    const materialsToInsert = materialIds.map(id => ({
      class_id: newClass.id,
      material_id: id
    }));
    
    const { error: materialError } = await supabaseAdmin
      .from('class_materials')
      .insert(materialsToInsert);
      
    if (materialError) {
      console.error('Error linking materials:', materialError);
      return { error: 'Error al vincular los materiales, pero la clase fue creada.' };
    }
  }

  revalidatePath(`/admin/student/${studentId}`);
  return { success: true };
}

export async function updateClassAction(
  studentId: string,
  classId: string,
  data: {
    title: string;
    date: string;
    status: string;
    duration: string;
    video_url: string;
    description: string;
    materialIds?: string[] | null;
  }
) {
  const user = await getCurrentUser();
  if (!user) return { error: 'No autenticado' };

  const adminCheck = await isAdmin(user);
  if (!adminCheck) return { error: 'Permisos insuficientes' };

  const supabaseAdmin = createAdminClient();

  const { error: updateError } = await supabaseAdmin
    .from('classes')
    .update({
      title: data.title,
      date: data.date,
      status: data.status,
      duration: data.duration,
      video_url: data.video_url,
      description: data.description,
    })
    .eq('id', classId);

  if (updateError) {
    console.error('Error updating class:', updateError);
    return { error: 'Error al actualizar la clase' };
  }

  // Handle material
  await supabaseAdmin
    .from('class_materials')
    .delete()
    .eq('class_id', classId);

  if (data.materialIds && data.materialIds.length > 0) {
    const materialsToInsert = data.materialIds.map(id => ({
      class_id: classId,
      material_id: id
    }));
    
    await supabaseAdmin
      .from('class_materials')
      .insert(materialsToInsert);
  }

  revalidatePath(`/admin/student/${studentId}`);
  return { success: true };
}
