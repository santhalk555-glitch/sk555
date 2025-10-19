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
  console.log(`[${requestId}] PERMANENT DELETE EXPIRED ACCOUNTS - Method: ${req.method}, Time: ${new Date().toISOString()}`);

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

    // Verify this is a cron job request (optional: add auth header check)
    const authHeader = req.headers.get('Authorization');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');
    
    if (expectedCronSecret && authHeader !== `Bearer ${expectedCronSecret}`) {
      console.error(`[${requestId}] Unauthorized cron request`);
      return new Response(JSON.stringify({ 
        error: 'Unauthorized',
        code: 'UNAUTHORIZED'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }

    console.log(`[${requestId}] Querying for expired deletion accounts`);
    
    // Find all users whose deletion has expired
    const { data: expiredProfiles, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, username, deleted_at, deletion_expires_at')
      .eq('is_deleted', true)
      .lte('deletion_expires_at', new Date().toISOString());

    if (queryError) {
      console.error(`[${requestId}] ERROR: Failed to query expired profiles:`, queryError);
      return new Response(JSON.stringify({ 
        error: 'Failed to query expired profiles',
        code: 'QUERY_FAILED',
        details: queryError.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!expiredProfiles || expiredProfiles.length === 0) {
      console.log(`[${requestId}] No expired accounts found`);
      return new Response(JSON.stringify({ 
        message: 'No expired accounts to delete',
        count: 0
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    console.log(`[${requestId}] Found ${expiredProfiles.length} expired accounts to delete`);

    const deletionResults = [];
    let successCount = 0;
    let failureCount = 0;

    // Process each expired account
    for (const profile of expiredProfiles) {
      const userId = profile.user_id;
      console.log(`[${requestId}] Processing user ${userId} (${profile.username || 'no username'})`);

      try {
        // Permanently delete the auth user (this will cascade to profiles and other tables)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
          console.error(`[${requestId}] Failed to delete user ${userId}:`, deleteError);
          failureCount++;
          deletionResults.push({
            user_id: userId,
            status: 'failed',
            error: deleteError.message
          });
          continue;
        }

        // Log successful deletion to audit table
        await supabaseAdmin
          .from('account_deletion_audit')
          .insert({
            user_id: userId,
            action: 'account_permanently_deleted',
            metadata: {
              deleted_at: profile.deleted_at,
              deletion_expires_at: profile.deletion_expires_at,
              deleted_by: 'cron_job',
              timestamp: new Date().toISOString()
            }
          });

        console.log(`[${requestId}] Successfully deleted user ${userId}`);
        successCount++;
        deletionResults.push({
          user_id: userId,
          status: 'success'
        });

      } catch (error: any) {
        console.error(`[${requestId}] Unexpected error deleting user ${userId}:`, error);
        failureCount++;
        deletionResults.push({
          user_id: userId,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log(`[${requestId}] Deletion complete - Success: ${successCount}, Failed: ${failureCount}`);

    return new Response(JSON.stringify({ 
      message: 'Deletion process completed',
      total: expiredProfiles.length,
      success: successCount,
      failed: failureCount,
      results: deletionResults
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error(`[${requestId}] UNEXPECTED ERROR:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      details: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
