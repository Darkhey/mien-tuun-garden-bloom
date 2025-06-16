
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !userRoles) {
      console.log('[admin-update-user] User is not admin:', user.id)
      return new Response(JSON.stringify({ error: 'Access denied - Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { userId, profile, roles, email, password } = await req.json()

    console.log('[admin-update-user] Updating user:', userId)

    // Update user email/password if provided
    if (email || password) {
      const updateData: any = {}
      if (email) updateData.email = email
      if (password) updateData.password = password

      const { error: updateAuthError } = await supabaseClient.auth.admin.updateUserById(
        userId,
        updateData
      )

      if (updateAuthError) {
        console.error('[admin-update-user] Error updating auth:', updateAuthError)
        return new Response(JSON.stringify({ error: updateAuthError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Update profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        custom_role: profile.custom_role,
        is_premium: profile.is_premium,
        description: profile.description
      })
      .eq('id', userId)

    if (profileError) {
      console.error('[admin-update-user] Error updating profile:', profileError)
      return new Response(JSON.stringify({ error: 'Failed to update user profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update roles if provided
    if (roles !== undefined) {
      // First, delete existing roles
      await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      // Then insert new roles
      if (roles.length > 0) {
        const roleInserts = roles.map((role: string) => ({
          user_id: userId,
          role: role
        }))

        const { error: rolesError } = await supabaseClient
          .from('user_roles')
          .insert(roleInserts)

        if (rolesError) {
          console.error('[admin-update-user] Error updating roles:', rolesError)
        }
      }
    }

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      _event_type: 'user_updated',
      _target_user_id: userId,
      _details: { 
        updated_by_admin: user.id,
        changes: { profile, roles, email_changed: !!email, password_changed: !!password }
      },
      _severity: 'medium'
    })

    console.log('[admin-update-user] User updated successfully:', userId)

    return new Response(JSON.stringify({
      success: true,
      message: 'User updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[admin-update-user] Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
