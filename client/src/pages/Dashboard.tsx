import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import AdminDashboard from './dashboard/AdminDashboard';
import MentorDashboard from './dashboard/MentorDashboard';
import StudentDashboard from './dashboard/StudentDashboard';
import SchoolAdminDashboard from './dashboard/SchoolAdminDashboard';

/**
 * Dashboard Router - Role-based dashboard routing
 * Supports multi-role users (e.g., "admin,mentor")
 */
export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check roles - support multi-role (e.g., "admin,mentor")
  const roles = user.role.split(',').map(r => r.trim());
  const hasSuperAdmin = roles.includes('super_admin');
  const hasAdmin = roles.includes('admin');
  const hasSchoolAdmin = roles.includes('school_admin');
  const hasMentor = roles.includes('mentor');
  const hasStudent = roles.includes('student');

  // Priority: Super Admin > Admin > School Admin > Mentor > Student
  if (hasSuperAdmin || hasAdmin) {
    return <AdminDashboard />;
  }

  if (hasSchoolAdmin) {
    return <SchoolAdminDashboard />;
  }

  if (hasMentor) {
    return <MentorDashboard />;
  }

  if (hasStudent) {
    return <StudentDashboard />;
  }

  // Fallback: redirect to home if no valid role
  setLocation('/');
  return null;
}
