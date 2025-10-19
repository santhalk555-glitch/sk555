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

    // Delete user from auth.users (this will cascade to related tables)
    console.log(`[${requestId}] Attempting to delete user account`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error(`[${requestId}] ERROR: Failed to delete user:`, {
        message: deleteError.message,
        status: deleteError.status,
        name: deleteError.name,
        userId: user.id
      });
      return new Response(JSON.stringify({ 
        error: 'Failed to delete account. Please contact support if this persists.',
        code: 'DELETE_FAILED',
        details: deleteError.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    console.log(`[${requestId}] SUCCESS: User account deleted - ID: ${user.id}`);
    return new Response(JSON.stringify({ 
      message: 'Account deleted successfully',
      success: true
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
