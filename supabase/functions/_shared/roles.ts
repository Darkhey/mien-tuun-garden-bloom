import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function isAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  })
  if (error) {
    console.error('[isAdmin] role check failed:', error)
    return false
  }
  return !!data
}
