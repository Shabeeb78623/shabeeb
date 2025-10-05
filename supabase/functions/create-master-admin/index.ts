import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create the admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Master Administrator'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      // If user already exists, get their ID
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const admin = existingUser?.users.find(u => u.email === 'admin@example.com')
      
      if (!admin) {
        throw authError
      }
      
      // Update existing user's profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: admin.id,
          full_name: 'Master Administrator',
          phone_number: '+971000000000',
          email: 'admin@example.com',
          emirates_id: '784-0000-0000000-0',
          mandalam: 'BALUSHERI',
          emirate: 'Dubai',
          registration_year: new Date().getFullYear(),
          status: 'approved'
        })

      if (profileError) throw profileError

      // Ensure master_admin role
      await supabaseAdmin
        .from('user_roles')
        .upsert({
          user_id: admin.id,
          role: 'master_admin'
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Admin user already exists and was updated',
          userId: admin.id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create profile for new user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: 'Master Administrator',
        phone_number: '+971000000000',
        email: 'admin@example.com',
        emirates_id: '784-0000-0000000-0',
        mandalam: 'BALUSHERI',
        emirate: 'Dubai',
        registration_year: new Date().getFullYear(),
        status: 'approved'
      })

    if (profileError) throw profileError

    // Create master_admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'master_admin'
      })

    if (roleError) throw roleError

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Master admin created successfully',
        userId: authData.user.id,
        email: 'admin@example.com'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
