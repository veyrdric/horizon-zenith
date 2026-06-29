import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getStudentById } from '@/lib/admin/queries';
import StudentDetailClient from '@/components/dashboard/students/StudentDetailClient';

export const metadata = {
  title: 'Detalle de Alumno - Horizon Zenith',
};

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  
  if (!user || !(await isAdmin(user))) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const studentData = await getStudentById(resolvedParams.id);

  if (!studentData) {
    return (
      <div className="min-h-screen bg-surface-backdrop flex flex-col items-center justify-center">
        <h1 className="text-surface-dark font-black text-2xl uppercase tracking-widest mb-4">Error 404</h1>
        <p className="text-text-muted font-bold tracking-widest uppercase text-sm mb-6">Operador no encontrado en los registros.</p>
        <a href="/admin" className="bg-brand text-surface-dark px-6 py-3 rounded-xl font-black tracking-widest text-xs uppercase shadow-island hover:bg-brand/80 transition-colors">
          Volver a Directorio
        </a>
      </div>
    );
  }

  return <StudentDetailClient studentData={studentData} />;
}
