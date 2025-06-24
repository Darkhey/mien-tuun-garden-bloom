import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin((data?.length ?? 0) > 0);
      setLoading(false);
    };

    checkAdmin();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        if (
          currentUser.id !== lastUserId.current ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED'
        ) {
          lastUserId.current = currentUser.id;
          checkAdmin();
        }
      } else {
        lastUserId.current = null;
        setIsAdmin(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading: loading };
}
