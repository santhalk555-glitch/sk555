import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Users, CheckCircle, Crown, Trophy } from 'lucide-react';
import ReportQuestionDialog from './ReportQuestionDialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Confetti from 'react-confetti';

interface QuizSessionProps {
  lobby: any;
  onBack: () => void;
}

interface Question {
  id: string;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: number;
  question_hindi?: string;
  option_1_hindi?: string;
  option_2_hindi?: string;
  option_3_hindi?: string;
  option_4_hindi?: string;
}

interface Participant {
  user_id: string;
  username: string;
  score: number;
  isWinner?: boolean;
  quiz_finished?: boolean;
}

const QuizSession = ({ lobby, onBack }: QuizSessionProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [currentUserFinished, setCurrentUserFinished] = useState(false);
  const [waitingForOthers, setWaitingForOthers] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Track window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load quiz data and create session when lobby becomes active
  useEffect(() => {
    console.log('=== QUIZ SESSION EFFECT ===');
    console.log('Lobby:', lobby);
    console.log('Lobby status:', lobby?.status);
    console.log('Quiz started:', quizStarted);
    console.log('Session ID:', sessionId);
    
    if (lobby && lobby.status === 'active' && !quizStarted && !sessionId) {
      console.log('QuizSession: Loading quiz data for active lobby:', lobby.id);
      
      // First check if a session already exists for this lobby
      const loadSession = async () => {
        try {
          const { data: existingSession, error: checkError } = await supabase
            .from('quiz_sessions')
            .select('*')
            .eq('lobby_id', lobby.id)
            .maybeSingle();
          
          if (checkError) {
            console.error('QuizSession: Error checking for existing session:', checkError);
            throw checkError;
          }
          
          if (existingSession) {
            console.log('QuizSession: Found existing session:', existingSession.id);
            setSessionId(existingSession.id);
            
            // Load questions from existing session
            const { data: questionsData, error: questionsError } = await supabase
              .from('quiz_questions')
              .select('*')
              .in('id', existingSession.question_ids);
            
            if (questionsError) throw questionsError;
            
            if (questionsData) {
              const orderedQuestions = existingSession.question_ids.map((id: string) => 
                questionsData.find((q: Question) => q.id === id)
              ).filter(Boolean) as Question[];
              
            console.log('QuizSession: Setting questions immediately');
            setQuestions(orderedQuestions);
            setAnswers(new Array(orderedQuestions.length).fill(''));
            // Set quiz started immediately so UI updates faster
            setQuizStarted(true);
            }
            
            // Load participants in parallel
            const participantsPromise = supabase
              .from('lobby_participants')
              .select('user_id, username')
              .eq('lobby_id', lobby.id);
            
            const { data: participants, error: participantsError } = await participantsPromise;
            
            if (participantsError) throw participantsError;
            if (participants) {
              setParticipants(participants.map(p => ({ ...p, score: 0 })));
            }
            
            console.log('QuizSession: Loaded existing session successfully');
          } else {
            // No existing session, create new one
            console.log('QuizSession: No existing session, creating new one');
            await initializeQuizSession();
            console.log('QuizSession: Quiz session initialized successfully');
            setQuizStarted(true);
          }
        } catch (error) {
          console.error('QuizSession: Failed to initialize quiz session:', error);
          toast({
            title: 'Error Loading Quiz',
            description: 'Failed to load questions. Please try again.',
            variant: 'destructive'
          });
        }
      };
      
      loadSession();
    }
  }, [lobby?.status, sessionId]);

  // Timer that auto-submits quiz when time runs out
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0 || currentUserFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, currentUserFinished]);


  const initializeQuizSession = async () => {
    console.log('initializeQuizSession: Starting for lobby:', lobby.id);
    console.log('initializeQuizSession: Lobby data:', {
      id: lobby.id,
      subject_id: lobby.subject_id,
      topic_id: lobby.topic_id,
      question_ids: lobby.question_ids
    });
    
    try {
      let questionsData: Question[] = [];

      // Check if lobby already has randomized questions
      if (lobby.question_ids && lobby.question_ids.length > 0) {
        console.log('initializeQuizSession: Loading pre-selected questions:', lobby.question_ids);
        
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .in('id', lobby.question_ids);

        if (error) {
          console.error('initializeQuizSession: Error loading questions:', error);
          throw error;
        }
        
        if (data) {
          questionsData = lobby.question_ids.map((id: string) => 
            data.find((q: Question) => q.id === id)
          ).filter(Boolean) as Question[];
        }
      } else {
        // Select and randomize questions
        console.log('initializeQuizSession: Selecting random questions');
        console.log('initializeQuizSession: Lobby query params:', {
          subject_id: lobby.subject_id,
          topic_id: lobby.topic_id,
          exam_simple_id: lobby.exam_simple_id,
          source_type: lobby.source_type
        });
        
        let allQuestions = [];
        let questionsError = null;

        // Try querying by subject_id first
        if (lobby.subject_id) {
          console.log('initializeQuizSession: Querying by subject_id:', lobby.subject_id);
          let questionsQuery = supabase
            .from('quiz_questions')
            .select('*')
            .eq('subject_id', lobby.subject_id)
            .limit(10000);

          if (lobby.topic_id) {
            console.log('initializeQuizSession: Adding topic filter:', lobby.topic_id);
            questionsQuery = questionsQuery.eq('topic_id', lobby.topic_id);
          }

          const result = await questionsQuery;
          questionsError = result.error;
          allQuestions = result.data || [];
          
          console.log('initializeQuizSession: Questions found by subject_id:', allQuestions.length);
        }

        // If no questions found by subject_id, try exam_simple_id
        if ((!allQuestions || allQuestions.length === 0) && lobby.exam_simple_id) {
          console.log('initializeQuizSession: No questions by subject_id, trying exam_simple_id:', lobby.exam_simple_id);
          
          let questionsQuery = supabase
            .from('quiz_questions')
            .select('*')
            .eq('exam_simple_id', lobby.exam_simple_id)
            .limit(10000);

          if (lobby.topic_id) {
            console.log('initializeQuizSession: Adding topic filter for exam query:', lobby.topic_id);
            questionsQuery = questionsQuery.eq('topic_id', lobby.topic_id);
          }

          const result = await questionsQuery;
          questionsError = result.error;
          allQuestions = result.data || [];
          
          console.log('initializeQuizSession: Questions found by exam_simple_id:', allQuestions.length);
        }

        if (questionsError) {
          console.error('initializeQuizSession: Error fetching questions:', questionsError);
          throw questionsError;
        }

        if (!allQuestions || allQuestions.length === 0) {
          console.error('initializeQuizSession: No questions found for any query method');
          console.error('initializeQuizSession: Tried subject_id:', lobby.subject_id, 'exam_simple_id:', lobby.exam_simple_id);
          throw new Error('No questions found for this exam/subject');
        }

        console.log('initializeQuizSession: Found', allQuestions.length, 'questions');
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        questionsData = shuffled.slice(0, 15);
        
        const questionIds = questionsData.map(q => q.id);
        console.log('initializeQuizSession: Saving question IDs to lobby');
        await supabase
          .from('game_lobbies')
          .update({ question_ids: questionIds })
          .eq('id', lobby.id);
      }

      console.log('initializeQuizSession: Questions loaded:', questionsData.length);
      setQuestions(questionsData);
      setAnswers(new Array(questionsData.length).fill(''));

      // Create quiz session
      console.log('initializeQuizSession: Creating quiz session');
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          lobby_id: lobby.id,
          question_ids: questionsData.map(q => q.id),
          status: 'active'
        })
        .select()
        .single();

      if (sessionError) {
        console.error('initializeQuizSession: Error creating session:', sessionError);
        throw sessionError;
      }
      
      console.log('initializeQuizSession: Session created:', session.id);
      setSessionId(session.id);

      // Get all lobby participants and create quiz_players records
      console.log('initializeQuizSession: Loading lobby participants');
      const { data: lobbyParticipants, error: participantsError } = await supabase
        .from('lobby_participants')
        .select('user_id, username')
        .eq('lobby_id', lobby.id);

      if (participantsError) {
        console.error('initializeQuizSession: Error loading participants:', participantsError);
        throw participantsError;
      }

      console.log('initializeQuizSession: Found', lobbyParticipants?.length, 'participants');

      if (lobbyParticipants) {
        // Create quiz_player record for current user only (RLS allows only own record)
        console.log('initializeQuizSession: Creating quiz_player record for current user');
        const currentParticipant = lobbyParticipants.find(p => p.user_id === user?.id);
        
        if (currentParticipant) {
          const { error: playerError } = await supabase
            .from('quiz_players')
            .insert({
              session_id: session.id,
              user_id: currentParticipant.user_id,
              username: currentParticipant.username
            });
          
          if (playerError) {
            console.error('initializeQuizSession: Error creating player record:', playerError);
            // Don't throw - other players will create their own records
            console.log('initializeQuizSession: Continuing despite player record error');
          }
        }

        setParticipants(lobbyParticipants.map(p => ({ ...p, score: 0 })));
        console.log('initializeQuizSession: Successfully initialized quiz session!');
      }
    } catch (error) {
      console.error('initializeQuizSession: Fatal error:', error);
      toast({
        title: 'Error Loading Quiz',
        description: error instanceof Error ? error.message : 'Failed to load questions. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Listen for realtime updates to quiz session status
  useEffect(() => {
    if (!sessionId || !currentUserFinished) return;

    console.log('QuizSession: Setting up realtime listener for session:', sessionId);

    const channel = supabase
      .channel(`quiz_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'quiz_sessions',
          filter: `id=eq.${sessionId}`
        },
        async (payload) => {
          console.log('Quiz session updated:', payload);
          
          if (payload.new.status === 'completed') {
            console.log('Session completed! Showing results...');
            setWaitingForOthers(false);
            await loadAndShowResults();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, currentUserFinished]);


  const handleAnswerSelect = (answer: string) => {
    // Save answer immediately when selected
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    // Check if all questions are answered
    const unansweredCount = answers.filter(a => !a).length;
    
    if (unansweredCount > 0) {
      toast({
        title: 'Incomplete Quiz',
        description: `You have ${unansweredCount} unanswered question(s). Submit anyway?`,
        variant: 'destructive'
      });
      // Give them a moment to see the warning, then submit
      setTimeout(() => {
        handleQuizEnd();
      }, 2000);
    } else {
      handleQuizEnd();
    }
  };

  const handleQuizEnd = async () => {
    if (!sessionId) {
      console.error('handleQuizEnd: No session ID available');
      return;
    }

    // Calculate current user's score
    let score = 0;
    answers.forEach((answer, index) => {
      if (questions[index] && parseInt(answer) === questions[index].correct_answer) {
        score++;
      }
    });

    console.log('handleQuizEnd: Calculated score:', score, 'out of', questions.length);

    try {
      // Update quiz_player record to mark as finished
      const { error: updateError } = await supabase
        .from('quiz_players')
        .update({ 
          score,
          answers: answers,
          quiz_finished: true,
          finished_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', user?.id);

      console.log('handleQuizEnd: Update result:', updateError ? 'ERROR' : 'SUCCESS');
      if (updateError) {
        console.error('handleQuizEnd: Update error:', updateError);
        throw updateError;
      }

      setCurrentUserFinished(true);

      // Check session status
      const { data: session } = await supabase
        .from('quiz_sessions')
        .select('status')
        .eq('id', sessionId)
        .single();

      if (session?.status === 'completed') {
        // Session already completed - show results immediately
        await loadAndShowResults();
      } else {
        // Wait for other players
        setWaitingForOthers(true);
        toast({
          title: 'Quiz Submitted!',
          description: 'Waiting for other players to finish...',
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const loadAndShowResults = async () => {
    if (!sessionId) {
      console.error('loadAndShowResults: No session ID available');
      return;
    }

    try {
      console.log('loadAndShowResults: Loading results for session:', sessionId);

      // Get all players' scores from quiz_players table
      const { data: allPlayers, error: playersError } = await supabase
        .from('quiz_players')
        .select('user_id, username, score')
        .eq('session_id', sessionId);

      console.log('loadAndShowResults: Players data from quiz_players:', allPlayers);
      if (playersError) {
        console.error('loadAndShowResults: Error fetching players:', playersError);
        throw playersError;
      }

      if (!allPlayers || allPlayers.length === 0) {
        console.error('loadAndShowResults: No players found for session');
        throw new Error('No players found for session');
      }

      console.log('loadAndShowResults: Number of players:', allPlayers.length);
      console.log('loadAndShowResults: Player scores:', allPlayers.map(p => ({ username: p.username, score: p.score })));

      // Determine winner(s)
      const maxScore = Math.max(...allPlayers.map(p => p.score));
      console.log('loadAndShowResults: Max score:', maxScore);
      
      const winners = allPlayers.filter(p => p.score === maxScore);
      console.log('loadAndShowResults: Winners:', winners.map(w => w.username));
      
      const isCurrentUserWinner = winners.some(w => w.user_id === user?.id);
      const currentUserScore = allPlayers.find(p => p.user_id === user?.id)?.score || 0;

      console.log('loadAndShowResults: Current user is winner?', isCurrentUserWinner);

      // Update participants state with ALL players' data
      const updatedParticipants = allPlayers.map(player => ({
        user_id: player.user_id,
        username: player.username,
        score: player.score,
        isWinner: winners.some(w => w.user_id === player.user_id)
      }));

      console.log('loadAndShowResults: Setting participants state with:', updatedParticipants);
      setParticipants(updatedParticipants);

      // Update current user's profile
      const participationPenalty = -5;
      const winnerBonus = 10;
      const totalPointsEarned = participationPenalty + (isCurrentUserWinner ? winnerBonus : 0);

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('quiz_points, victory_count')
        .eq('user_id', user?.id)
        .single();

      if (currentProfile) {
        const newQuizPoints = Math.max(0, currentProfile.quiz_points + totalPointsEarned);
        const newVictoryCount = currentProfile.victory_count + (isCurrentUserWinner ? 1 : 0);

        console.log('loadAndShowResults: Updating profile - old points:', currentProfile.quiz_points, 'new points:', newQuizPoints);

        await supabase
          .from('profiles')
          .update({ 
            quiz_points: newQuizPoints,
            victory_count: newVictoryCount
          })
          .eq('user_id', user?.id);

        // Add activity
        await supabase
          .from('recent_activities')
          .insert({
            user_id: user?.id,
            activity_type: 'quiz_completed',
            description: `Completed multiplayer quiz${isCurrentUserWinner ? ' - Victory!' : ''}`,
            metadata: {
              score: currentUserScore,
              max_score: questions.length,
              points_earned: totalPointsEarned,
              victory: isCurrentUserWinner,
              participants_count: allPlayers.length
            }
          });
      }

      toast({
        title: isCurrentUserWinner ? '🎉 You Won!' : 'Quiz Completed!',
        description: `You scored ${currentUserScore}/${questions.length} (${isCurrentUserWinner ? `Winner! +${totalPointsEarned}` : `${totalPointsEarned}`} points)`,
        className: isCurrentUserWinner ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' : undefined
      });

      setShowResults(true);
      console.log('loadAndShowResults: Results displayed successfully');
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: 'Error',
        description: 'Failed to load results.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!quizStarted) {
    console.log('=== RENDERING LOADING STATE ===');
    console.log('Questions loaded:', questions.length);
    console.log('Session ID:', sessionId);
    
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Quiz Starting Soon...
            </h1>
            <p className="text-muted-foreground">
              Waiting for the quiz to begin.
            </p>
            <p className="text-xs text-muted-foreground mt-2">Check browser console (F12) for loading details</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    console.log('=== NO QUESTIONS LOADED ===');
    console.log('Lobby data:', lobby);
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Quiz</CardTitle>
              <CardDescription>Failed to load quiz questions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Unable to load questions for this quiz. Please try again or go back to the lobby.</p>
              <Button onClick={onBack}>Go Back to Lobby</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (waitingForOthers) {
    const score = answers.filter((answer, index) => 
      questions[index] && parseInt(answer) === questions[index].correct_answer
    ).length;

    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Quiz Submitted!</CardTitle>
              <CardDescription className="text-lg">
                Waiting for other players to finish...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary mb-2">
                  {score}/{questions.length}
                </div>
                <p className="text-muted-foreground">Your Score</p>
                
                <div className="mt-8 p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Other Players</span>
                  </div>
                  <div className="flex justify-center space-x-2">
                    {participants.filter(p => p.user_id !== user?.id).map((participant) => (
                      <div key={participant.user_id} className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                          <span className="text-sm font-semibold">
                            {participant.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground animate-pulse">
                          Still playing...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 text-sm text-muted-foreground">
                  <p>⏳ The results will appear automatically</p>
                  <p className="mt-1">when all players have finished</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = answers.filter((answer, index) => 
      questions[index] && parseInt(answer) === questions[index].correct_answer
    ).length;

    const currentUserParticipant = participants.find(p => p.user_id === user?.id);
    const isWinner = currentUserParticipant?.isWinner || false;

    console.log('RESULTS RENDER - Participants state:', participants);
    console.log('RESULTS RENDER - Participants count:', participants.length);
    console.log('RESULTS RENDER - Current user is winner:', isWinner);
    console.log('RESULTS RENDER - Participants data:', participants.map(p => ({
      username: p.username,
      score: p.score,
      isWinner: p.isWinner
    })));

    return (
      <div className="pt-20 pb-12">
        {/* Confetti for winner */}
        {isWinner && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        )}
        
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Winner Animation */}
          {isWinner && (
            <div className="fixed inset-0 pointer-events-none z-40">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-300/20 to-yellow-400/20 animate-pulse"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-bounce">
                  <Trophy className="w-32 h-32 text-yellow-500 drop-shadow-2xl" />
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center mb-8">
            {isWinner ? (
              <>
                <div className="mb-4 animate-pulse">
                  <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                  🎉 WINNER! 🎉
                </h1>
              </>
            ) : (
              <h1 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Quiz Results
              </h1>
            )}
            <div className="text-6xl font-bold text-primary mb-4">
              {score}/{questions.length}
            </div>
            <p className="text-xl text-muted-foreground">
              {isWinner ? 'Congratulations! You won the quiz!' :
               score >= questions.length * 0.8 ? 'Excellent work!' : 
               score >= questions.length * 0.6 ? 'Good job!' : 
               'Keep practicing!'}
            </p>
          </div>

          {/* Leaderboard */}
          <Card className="mb-8 bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Trophy className="w-5 h-5 mr-2" />
                Final Leaderboard
                {participants.length < 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('Manual refresh triggered');
                      loadAndShowResults();
                    }}
                    className="ml-2"
                  >
                    Refresh
                  </Button>
                )}
              </CardTitle>
              {participants.length < 2 && (
                <CardDescription className="text-center text-yellow-600">
                  ⚠️ Not all players loaded. Click Refresh to try again.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <p>No player data found. Please refresh the page.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .map((participant, index) => (
                      <div 
                        key={participant.user_id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          participant.isWinner 
                            ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300' 
                            : 'bg-muted/20 border border-muted/40'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            participant.isWinner 
                              ? 'bg-yellow-500 text-white' 
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {participant.isWinner ? (
                              <Crown className="w-5 h-5" />
                            ) : (
                              <span className="font-bold">#{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center">
                              @{participant.username}
                              {participant.user_id === user?.id && (
                                <Badge variant="outline" className="ml-2">You</Badge>
                              )}
                              {participant.isWinner && (
                                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">Winner</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {participant.score || 0}/{questions.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(((participant.score || 0) / questions.length) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Question {index + 1}</span>
                       <div className="flex items-center space-x-2">
                         {parseInt(answers[index]) === question.correct_answer ? (
                           <CheckCircle className="w-5 h-5 text-green-500" />
                         ) : (
                           <span className="text-red-500">✗</span>
                         )}
                        <ReportQuestionDialog 
                          questionId={question.id}
                          questionText={question.question}
                        />
                      </div>
                    </div>
                    <div className="mb-2 space-y-1">
                      <p>{question.question}</p>
                      {question.question_hindi && (
                        <p className="text-muted-foreground">{question.question_hindi}</p>
                      )}
                    </div>
                    <div className="text-sm">
                      <p>Your answer: <span className={parseInt(answers[index]) === question.correct_answer ? 'text-green-600' : 'text-red-600'}>{answers[index]}</span></p>
                      <p>Correct answer: <span className="text-green-600">{question.correct_answer}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={onBack} className="bg-gradient-primary hover:opacity-90">
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    console.log('QuizSession: Rendering loading state. quizStarted:', quizStarted, 'questions.length:', questions.length);
    console.log('QuizSession: Lobby data:', { 
      id: lobby.id, 
      status: lobby.status, 
      subject_id: lobby.subject_id, 
      topic_id: lobby.topic_id 
    });
    
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-2xl">
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Loading Questions...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Please wait while we load your quiz</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Lobby: {lobby.id}</p>
                  <p>Subject ID: {lobby.subject_id || 'Not set'}</p>
                  <p>Topic ID: {lobby.topic_id || 'Not set'}</p>
                  <p>Status: {lobby.status}</p>
                </div>
              </div>
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Retrying to load questions...');
                    initializeQuizSession();
                  }}
                  className="mt-4"
                >
                  Retry Loading
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  console.log('QuizSession: Rendering quiz with', questions.length, 'questions. Current index:', currentQuestionIndex);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Quiz
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {lobby.subject} Quiz
            </h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge variant="outline" className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {participants.length}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Question Card */}
        <Card className="mb-8 bg-gradient-card border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              {answers[currentQuestionIndex] && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Answered
                </Badge>
              )}
            </div>
            <CardDescription className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                {currentQuestion.question}
              </p>
              {currentQuestion.question_hindi && (
                <p className="text-lg text-muted-foreground">
                  {currentQuestion.question_hindi}
                </p>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((option) => {
                const optionText = currentQuestion[`option_${option}` as keyof Question] as string;
                const optionHindi = currentQuestion[`option_${option}_hindi` as keyof Question] as string | undefined;
                
                return (
                  <Button
                    key={option}
                    variant={answers[currentQuestionIndex] === option.toString() ? "default" : "outline"}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      answers[currentQuestionIndex] === option.toString() ? 'bg-gradient-primary text-white' : ''
                    }`}
                    onClick={() => handleAnswerSelect(option.toString())}
                  >
                    <span className="font-semibold mr-3 shrink-0">{option}.</span>
                    <div className="flex flex-col gap-1">
                      <span>{optionText}</span>
                      {optionHindi && (
                        <span className={answers[currentQuestionIndex] === option.toString() ? 'opacity-80' : 'text-muted-foreground'}>
                          {optionHindi}
                        </span>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="flex gap-4 items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1"
          >
            ← Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {answers.filter(a => a).length} / {questions.length} answered
          </div>
          
          <Button
            variant="outline"
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex-1"
          >
            Next →
          </Button>
        </div>

        {/* Submit Quiz Button */}
        <div className="text-center">
          <Button 
            onClick={submitQuiz}
            className="bg-gradient-primary hover:opacity-90 px-8 py-3 w-full"
            size="lg"
          >
            Submit Quiz
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You can review and change your answers before submitting
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizSession;