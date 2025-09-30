import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Users, CheckCircle, Crown, Trophy } from 'lucide-react';
import ReportQuestionDialog from './ReportQuestionDialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  explanation?: string;
}

interface Participant {
  user_id: string;
  username: string;
  score: number;
  isWinner?: boolean;
}

const QuizSession = ({ lobby, onBack }: QuizSessionProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (lobby && lobby.status === 'active') {
      loadQuizData();
      setQuizStarted(true);
    }
  }, [lobby]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft]);

  const loadQuizData = async () => {
    try {
      // Fetch questions based on the hierarchical structure using simple_ids
      let questionsQuery = supabase
        .from('quiz_questions')
        .select('*')
        .limit(15);

      // Primary approach: Use simple_id fields from lobby
      if (lobby.exam_simple_id) {
        questionsQuery = questionsQuery.eq('exam_simple_id', lobby.exam_simple_id);

        // Add subject filter if available
        if (lobby.subject_simple_id) {
          questionsQuery = questionsQuery.eq('subject_simple_id', lobby.subject_simple_id);
        }

        // Add topic filter if available (for practice mode)
        if (lobby.topic_simple_id) {
          questionsQuery = questionsQuery.eq('topic_simple_id', lobby.topic_simple_id);
        }
      } else if (lobby.subject_simple_id) {
        // Fallback: If only subject_simple_id is available
        questionsQuery = questionsQuery.eq('subject_simple_id', lobby.subject_simple_id);
        
        if (lobby.topic_simple_id) {
          questionsQuery = questionsQuery.eq('topic_simple_id', lobby.topic_simple_id);
        }
      } else {
        // Last resort: Try to find subject data dynamically from database
        console.warn('Lobby missing simple_id fields, attempting dynamic lookup');
        
        if (lobby.subject_id) {
          const { data: subjectData } = await supabase
            .from('subjects_hierarchy')
            .select('simple_id, exam_simple_id')
            .eq('id', lobby.subject_id)
            .maybeSingle();

          if (subjectData?.simple_id) {
            questionsQuery = questionsQuery.eq('subject_simple_id', subjectData.simple_id);
            
            if (subjectData.exam_simple_id) {
              questionsQuery = questionsQuery.eq('exam_simple_id', subjectData.exam_simple_id);
            }
          }
        }

        if (lobby.topic_id) {
          const { data: topicData } = await supabase
            .from('topics')
            .select('simple_id')
            .eq('id', lobby.topic_id)
            .maybeSingle();

          if (topicData?.simple_id) {
            questionsQuery = questionsQuery.eq('topic_simple_id', topicData.simple_id);
          }
        }
      }

      const { data: questionsData, error: questionsError } = await questionsQuery;

      if (questionsError) throw questionsError;

      console.log(`Fetching questions for lobby:`, lobby);
      console.log('Questions found:', questionsData?.length || 0);

      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData);
        setAnswers(new Array(questionsData.length).fill(''));
      } else {
        console.error(`No questions found for the selected topic/subject`);
        toast({
          title: 'No Questions Available',
          description: `No questions found for the selected topic. Please contact support or try a different topic.`,
          variant: 'destructive'
        });
      }

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('lobby_participants')
        .select('user_id, username')
        .eq('lobby_id', lobby.id);

      if (participantsError) throw participantsError;

      if (participantsData) {
        setParticipants(participantsData.map(p => ({ ...p, score: 0 })));
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quiz data.',
        variant: 'destructive'
      });
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      handleQuizEnd();
    }
  };

  const handleQuizEnd = async () => {
    setShowResults(true);
    
    // Calculate current user's score
    let score = 0;
    answers.forEach((answer, index) => {
      if (questions[index] && parseInt(answer) === questions[index].correct_answer) {
        score++;
      }
    });

    try {
      // Update current user's score first
      const { error: updateError } = await supabase
        .from('quiz_participants')
        .update({ 
          score,
          answers: answers 
        })
        .eq('lobby_id', lobby.id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // Wait a moment for score to be updated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get all participants' scores to determine winner(s)
      const { data: allParticipants, error: participantsError } = await supabase
        .from('quiz_participants')
        .select('user_id, score')
        .eq('lobby_id', lobby.id);

      if (participantsError) throw participantsError;

      // Get profiles for all participants
      const userIds = allParticipants.map(p => p.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, quiz_points, victory_count')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine participant data with profiles
      const participantsWithProfiles = allParticipants.map(participant => {
        const profile = profiles.find(p => p.user_id === participant.user_id);
        return {
          ...participant,
          profile: profile || { username: 'Unknown', quiz_points: 100, victory_count: 0 }
        };
      });

      // Determine winner(s) - highest score wins
      const maxScore = Math.max(...participantsWithProfiles.map(p => p.score));
      const winners = participantsWithProfiles.filter(p => p.score === maxScore);
      const isCurrentUserWinner = winners.some(w => w.user_id === user?.id);

      // New points system: -5 for all players, +10 additional for winner(s)
      const participationPenalty = -5;
      const winnerBonus = 10;
      const totalPointsEarned = participationPenalty + (isCurrentUserWinner ? winnerBonus : 0);

      // Update all participants' points
      for (const participant of participantsWithProfiles) {
        const isWinner = winners.some(w => w.user_id === participant.user_id);
        const participantPoints = participationPenalty + (isWinner ? winnerBonus : 0);
        const newQuizPoints = Math.max(0, participant.profile.quiz_points + participantPoints);
        const newVictoryCount = participant.profile.victory_count + (isWinner ? 1 : 0);

        await supabase
          .from('profiles')
          .update({ 
            quiz_points: newQuizPoints,
            victory_count: newVictoryCount
          })
          .eq('user_id', participant.user_id);

        // Add activity for each participant
        await supabase
          .from('recent_activities')
          .insert({
            user_id: participant.user_id,
            activity_type: 'quiz_completed',
            description: `Completed multiplayer quiz${isWinner ? ' - Victory!' : ''}`,
            metadata: {
              score: participant.score,
              max_score: questions.length,
              points_earned: participantPoints,
              victory: isWinner,
              participants_count: participantsWithProfiles.length
            }
          });
      }

      // Update participants state with winner info
      setParticipants(prev => prev.map(p => ({
        ...p,
        score: participantsWithProfiles.find(pp => pp.user_id === p.user_id)?.score || 0,
        isWinner: winners.some(w => w.user_id === p.user_id)
      })));

      const scorePercentage = Math.round((score / questions.length) * 100);
      
      toast({
        title: isCurrentUserWinner ? '🎉 You Won!' : 'Quiz Completed!',
        description: `You scored ${score}/${questions.length} (${isCurrentUserWinner ? `Winner! +${totalPointsEarned}` : `${totalPointsEarned}`} points)`,
        className: isCurrentUserWinner ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' : undefined
      });
    } catch (error) {
      console.error('Error updating scores:', error);
      toast({
        title: 'Quiz Completed!',
        description: `You scored ${score}/${questions.length} questions correctly.`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!quizStarted) {
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
          </div>
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

    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Winner Animation */}
          {isWinner && (
            <div className="fixed inset-0 pointer-events-none z-50">
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
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    <p className="mb-2">{question.question}</p>
                    <div className="text-sm">
                      <p>Your answer: <span className={parseInt(answers[index]) === question.correct_answer ? 'text-green-600' : 'text-red-600'}>{answers[index]}</span></p>
                      <p>Correct answer: <span className="text-green-600">{question.correct_answer}</span></p>
                      {question.explanation && (
                        <p className="text-muted-foreground mt-1">{question.explanation}</p>
                      )}
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
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              Question {currentQuestionIndex + 1}
            </CardTitle>
            <CardDescription className="text-lg font-medium text-foreground">
              {currentQuestion.question}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((option) => (
                <Button
                  key={option}
                  variant={selectedAnswer === option.toString() ? "default" : "outline"}
                  className={`w-full text-left justify-start p-4 h-auto ${
                    selectedAnswer === option.toString() ? 'bg-gradient-primary text-white' : ''
                  }`}
                  onClick={() => handleAnswerSelect(option.toString())}
                >
                  <span className="font-semibold mr-3">{option}.</span>
                  <span>{currentQuestion[`option_${option}` as keyof Question]}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="text-center">
          <Button 
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            className="bg-gradient-primary hover:opacity-90 px-8 py-3"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSession;