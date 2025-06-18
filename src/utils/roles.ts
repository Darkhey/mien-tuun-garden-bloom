import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export async function hasRole(
  userId: string,
  role: Database["public"]["Enums"]["app_role"]
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: role
  });
  if (error) {
    console.error('[hasRole] Error checking role:', error);
    return false;
  }
  return !!data;
}
