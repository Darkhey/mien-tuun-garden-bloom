import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    const checkAdmin = async (userParam?: { id: string }) => {
      const user = userParam ?? (await supabase.auth.getSession()).data.session?.user;
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      currentUserId.current = user.id;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .returns<{ role: string }[]>();
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setIsAdmin((data?.length ?? 0) > 0);
      setIsLoading(false);
    };

    checkAdmin();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        if ((user.id !== currentUserId.current) && (_event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED')) {
          setIsLoading(true);
          checkAdmin(user);
        }
      } else {
        currentUserId.current = null;
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, isLoading };
}
