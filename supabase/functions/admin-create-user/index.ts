
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
      console.log('[admin-create-user] User is not admin:', user.id)
      return new Response(JSON.stringify({ error: 'Access denied - Admin role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { email, password, profile, roles } = await req.json()

    console.log('[admin-create-user] Creating user:', email)

    // Create user using admin API
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email for admin-created users
    })

    if (createError) {
      console.error('[admin-create-user] Error creating user:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if profile already exists (in case of duplicate creation attempts)
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', newUser.user.id)
      .single()

    // Only create profile if it doesn't exist
    if (!existingProfile) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert([{
          id: newUser.user.id,
          display_name: profile.display_name || email.split('@')[0],
          avatar_url: profile.avatar_url || null,
          custom_role: profile.custom_role || null,
          is_premium: profile.is_premium || false,
          description: profile.description || null
        }])

      if (profileError) {
        console.error('[admin-create-user] Error creating profile:', profileError)
        // Try to clean up the user if profile creation failed
        await supabaseClient.auth.admin.deleteUser(newUser.user.id)
        return new Response(JSON.stringify({ error: 'Failed to create user profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Assign roles if provided
    if (roles && roles.length > 0) {
      const roleInserts = roles.map((role: string) => ({
        user_id: newUser.user.id,
        role: role
      }))

      const { error: rolesError } = await supabaseClient
        .from('user_roles')
        .insert(roleInserts)

      if (rolesError) {
        console.error('[admin-create-user] Error assigning roles:', rolesError)
      }
    }

    // Log security event
    await supabaseClient.rpc('log_security_event', {
      _event_type: 'user_created',
      _target_user_id: newUser.user.id,
      _details: { 
        email: email,
        created_by_admin: user.id,
        roles: roles || []
      },
      _severity: 'medium'
    })

    console.log('[admin-create-user] User created successfully:', newUser.user.id)

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        created_at: newUser.user.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[admin-create-user] Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
