import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  is_active: boolean;
}

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperadmin?: boolean;
}

export default function AdminGuard({ children, requireSuperadmin = false }: AdminGuardProps) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // 1. Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Auth error:', authError);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      // 2. Check if user is in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, role, is_active')
        .eq('user_id', user.id)
        .single();

      if (adminError || !adminData) {
        console.error('Not an admin user:', user.email);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      // 3. Check if admin is active
      if (!adminData.is_active) {
        console.error('Admin account is deactivated:', adminData.email);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      // 4. Check if superadmin required
      if (requireSuperadmin && adminData.role !== 'superadmin') {
        console.error('Superadmin access required');
        navigate('/admin/dashboard');
        return;
      }

      // 5. All checks passed
      setAdminUser(adminData as AdminUser);
      setLoading(false);

    } catch (error) {
      console.error('Error checking admin access:', error);
      await supabase.auth.signOut();
      navigate('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-fed-red-500 mx-auto mb-4" />
          <p className="text-light-100 font-medium">Verification des acces administrateur...</p>
          <p className="text-sm text-light-400 mt-2">Authentification en cours</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return <>{children}</>;
}
