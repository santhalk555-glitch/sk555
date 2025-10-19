import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] DELETE ACCOUNT REQUEST - Method: ${req.method}, Time: ${new Date().toISOString()}`);

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${requestId}] ERROR: Missing authorization header`);
      return new Response(JSON.stringify({ 
        error: 'Missing authorization header',
        code: 'AUTH_HEADER_MISSING'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    console.log(`[${requestId}] Extracting token from auth header`);
    const token = authHeader.replace('Bearer ', '');
    
    // Get user from JWT
    console.log(`[${requestId}] Validating user token`);
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError) {
      console.error(`[${requestId}] ERROR: Failed to validate token:`, {
        message: userError.message,
        status: userError.status,
        name: userError.name
      });
      return new Response(JSON.stringify({ 
        error: 'Invalid or expired token. Please log in again.',
        code: 'INVALID_TOKEN',
        details: userError.message
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!user) {
      console.error(`[${requestId}] ERROR: No user found from token`);
      return new Response(JSON.stringify({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    console.log(`[${requestId}] User validated - ID: ${user.id}, Email: ${user.email}`);

    // Soft delete: Schedule account for deletion after 30 days
    console.log(`[${requestId}] Attempting to soft delete user account (30-day grace period)`);
    
    const deletionExpiresAt = new Date();
    deletionExpiresAt.setDate(deletionExpiresAt.getDate() + 30);
    
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deletion_expires_at: deletionExpiresAt.toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error(`[${requestId}] ERROR: Failed to schedule deletion:`, {
        message: updateError.message,
        details: updateError.details,
        userId: user.id
      });
      return new Response(JSON.stringify({ 
        error: 'Failed to schedule account deletion. Please contact support if this persists.',
        code: 'DELETE_FAILED',
        details: updateError.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // Log to audit table
    await supabaseAdmin
      .from('account_deletion_audit')
      .insert({
        user_id: user.id,
        action: 'account_deletion_scheduled',
        metadata: {
          deletion_expires_at: deletionExpiresAt.toISOString(),
          email: user.email
        }
      });

    console.log(`[${requestId}] SUCCESS: User account scheduled for deletion - ID: ${user.id}, Expires: ${deletionExpiresAt.toISOString()}`);
    return new Response(JSON.stringify({ 
      message: 'Account scheduled for deletion',
      success: true,
      deletion_expires_at: deletionExpiresAt.toISOString()
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error(`[${requestId}] UNEXPECTED ERROR:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
