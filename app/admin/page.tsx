import { getCurrentUser, getCurrentProfile, isAdmin } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getAllStudents } from '@/lib/admin/queries';
import MentorDashboard from '@/components/dashboard/MentorDashboard';

export const metadata = {
  title: 'Consola Horizon Zenith',
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const hasAdminAccess = await isAdmin(user);
  if (!hasAdminAccess) {
    redirect('/hub');
  }

  const students = await getAllStudents();

  return <MentorDashboard serverStudents={students} />;
}
