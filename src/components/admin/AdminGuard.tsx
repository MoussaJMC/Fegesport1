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
        console.error('AdminGuard: Auth error or no user', authError);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      console.log('AdminGuard: User authenticated:', user.email, 'ID:', user.id);

      // 2. Check if user is in admin_users table — try by user_id first, then by email
      let adminData = null;
      let adminError = null;

      // Try by user_id
      const result1 = await supabase
        .from('admin_users')
        .select('id, email, role, is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (result1.data) {
        adminData = result1.data;
        console.log('AdminGuard: Found admin by user_id:', adminData);
      } else {
        console.log('AdminGuard: Not found by user_id, trying email...', result1.error?.message);

        // Fallback: try by email
        const result2 = await supabase
          .from('admin_users')
          .select('id, email, role, is_active')
          .eq('email', user.email)
          .maybeSingle();

        if (result2.data) {
          adminData = result2.data;
          console.log('AdminGuard: Found admin by email:', adminData);

          // Update user_id for future lookups
          await supabase
            .from('admin_users')
            .update({ user_id: user.id })
            .eq('email', user.email);
          console.log('AdminGuard: Updated user_id in admin_users');
        } else {
          adminError = result2.error;
          console.error('AdminGuard: Not found by email either:', result2.error?.message);
        }
      }

      if (!adminData) {
        console.error('AdminGuard: Not an admin user:', user.email);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      // 3. Check if admin is active
      if (!adminData.is_active) {
        console.error('AdminGuard: Admin account is deactivated:', adminData.email);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      // 4. Check if superadmin required
      if (requireSuperadmin && adminData.role !== 'superadmin') {
        console.error('AdminGuard: Superadmin access required');
        navigate('/admin');
        return;
      }

      // 5. All checks passed
      console.log('AdminGuard: Access granted for', adminData.email, 'role:', adminData.role);
      setAdminUser(adminData as AdminUser);
      setLoading(false);

    } catch (error) {
      console.error('AdminGuard: Error checking admin access:', error);
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
