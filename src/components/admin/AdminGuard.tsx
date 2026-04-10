import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperadmin?: boolean;
}

export default function AdminGuard({ children, requireSuperadmin = false }: AdminGuardProps) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      try {
        // 1. Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error('AdminGuard: No session', sessionError);
          if (!cancelled) {
            navigate('/admin/login', { replace: true });
          }
          return;
        }

        const user = session.user;
        console.log('AdminGuard: Session found for', user.email);

        // 2. Check admin_users — try user_id, then email
        let isAdmin = false;

        const { data: byUserId } = await supabase
          .from('admin_users')
          .select('id, email, role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (byUserId) {
          console.log('AdminGuard: Found by user_id:', byUserId.email);
          isAdmin = true;
        } else {
          // Fallback: check by email
          const { data: byEmail } = await supabase
            .from('admin_users')
            .select('id, email, role, is_active')
            .eq('email', user.email)
            .eq('is_active', true)
            .maybeSingle();

          if (byEmail) {
            console.log('AdminGuard: Found by email:', byEmail.email);
            isAdmin = true;
            // Auto-fix: update user_id
            await supabase
              .from('admin_users')
              .update({ user_id: user.id })
              .eq('id', byEmail.id);
          } else {
            console.log('AdminGuard: Not found in admin_users. Checking with RPC...');
            // Last resort: maybe RLS blocks SELECT — try a different approach
            try {
              const { data: rpcResult } = await supabase.rpc('is_admin');
              if (rpcResult === true) {
                console.log('AdminGuard: is_admin() returned true');
                isAdmin = true;
              }
            } catch (e) {
              console.log('AdminGuard: is_admin() not available');
            }
          }
        }

        if (!isAdmin) {
          console.error('AdminGuard: User is not admin, signing out');
          await supabase.auth.signOut();
          if (!cancelled) {
            navigate('/admin/login', { replace: true });
          }
          return;
        }

        console.log('AdminGuard: ACCESS GRANTED');
        if (!cancelled) {
          setVerified(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('AdminGuard: Unexpected error:', error);
        if (!cancelled) {
          navigate('/admin/login', { replace: true });
        }
      }
    };

    verify();

    return () => { cancelled = true; };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-fed-red-500 mx-auto mb-4" />
          <p className="text-light-100 font-medium">Verification des acces...</p>
        </div>
      </div>
    );
  }

  if (!verified) return null;

  return <>{children}</>;
}
