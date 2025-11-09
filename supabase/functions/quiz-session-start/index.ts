import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Seeded shuffle function for consistent randomization
function shuffleWithSeed(array: any[], seed: number): any[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  // Simple seeded random function
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  
  return shuffled;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      throw new Error('Unauthorized');
    }

    const { lobbyId } = await req.json();
    console.log(`Starting quiz session for lobby: ${lobbyId}, user: ${user.id}`);

    // Check if session already exists
    const { data: existingSession, error: checkError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('lobby_id', lobbyId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing session:', checkError);
      throw checkError;
    }

    if (existingSession) {
      console.log('Session already exists:', existingSession.id);
      return new Response(
        JSON.stringify({
          sessionId: existingSession.id,
          lobbyId: existingSession.lobby_id,
          questionSet: existingSession.question_ids,
          orderSeed: existingSession.order_seed,
          startsAt: existingSession.starts_at,
          status: existingSession.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lobby details
    const { data: lobby, error: lobbyError } = await supabase
      .from('game_lobbies')
      .select('*')
      .eq('id', lobbyId)
      .single();

    if (lobbyError || !lobby) {
      console.error('Lobby not found:', lobbyError);
      throw new Error('Lobby not found');
    }

    console.log('Lobby details:', lobby);

    // Fetch questions based on lobby criteria
    let questionsQuery = supabase
      .from('quiz_questions')
      .select('*')
      .range(0, 9999);

    if (lobby.subject_id) {
      questionsQuery = questionsQuery.eq('subject_id', lobby.subject_id);
    } else if (lobby.exam_simple_id) {
      questionsQuery = questionsQuery.eq('exam_simple_id', lobby.exam_simple_id);
    }

    if (lobby.topic_id) {
      questionsQuery = questionsQuery.eq('topic_id', lobby.topic_id);
    }

    const { data: allQuestions, error: questionsError } = await questionsQuery;

    if (questionsError || !allQuestions || allQuestions.length === 0) {
      console.error('No questions found:', questionsError);
      throw new Error('No questions available for this quiz');
    }

    console.log(`Found ${allQuestions.length} questions for quiz`);

    // Generate secure random seed
    const orderSeed = Math.floor(Math.random() * 1000000);
    console.log('Generated order seed:', orderSeed);

    // Shuffle questions using seed
    const shuffled = shuffleWithSeed(allQuestions, orderSeed);
    const selectedQuestions = shuffled.slice(0, 15);
    const questionIds = selectedQuestions.map(q => q.id);

    console.log('Selected question IDs:', questionIds);

    // Set start time (5 seconds from now for countdown)
    const startsAt = new Date(Date.now() + 5000).toISOString();
    const expiresAt = new Date(Date.now() + (15 * 60 * 1000) + 5000).toISOString(); // 15 minutes + countdown

    // Create quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        lobby_id: lobbyId,
        question_ids: questionIds,
        order_seed: orderSeed,
        starts_at: startsAt,
        expires_at: expiresAt,
        status: 'active'
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    console.log('Quiz session created:', session.id);

    // Update lobby with question IDs
    await supabase
      .from('game_lobbies')
      .update({ question_ids: questionIds })
      .eq('id', lobbyId);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        lobbyId: session.lobby_id,
        questionSet: questionIds,
        orderSeed: orderSeed,
        startsAt: startsAt,
        status: 'active'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quiz-session-start:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});