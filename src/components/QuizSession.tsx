import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, Users, CheckCircle } from 'lucide-react';
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
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
}

interface Participant {
  user_id: string;
  username: string;
  score: number;
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
      // Fetch questions based on the new hierarchical structure
      let questionsQuery = supabase
        .from('quiz_questions')
        .select('*')
        .limit(15);

      // If lobby has new structure, use it
      if (lobby.source_type && lobby.subject_id && lobby.topic_id) {
        questionsQuery = questionsQuery
          .eq('source_type', lobby.source_type)
          .eq('subject_id', lobby.subject_id)
          .eq('topic_id', lobby.topic_id);

        if (lobby.source_type === 'course' && lobby.course_id) {
          questionsQuery = questionsQuery.eq('course_id', lobby.course_id);
        } else if (lobby.source_type === 'exam' && lobby.exam_id) {
          questionsQuery = questionsQuery.eq('exam_id', lobby.exam_id);
        }
      } else {
        // Fallback to old subject-based approach for backward compatibility
        const subjectMapping: { [key: string]: string } = {
          'Mechanical Engineering': 'mechanical_engineering',
          'Electrical Engineering': 'electrical_engineering', 
          'Civil Engineering': 'civil_engineering',
          'Computer Science': 'computer_science',
          'Information Technology': 'information_technology',
          'Mathematics': 'mathematics',
          'Physics': 'physics',
          'Chemistry': 'chemistry',
          'Biology': 'biology',
          'English': 'english',
          'History': 'history',
          'Geography': 'geography',
          'Economics': 'economics',
          'Psychology': 'psychology',
          'Engineering': 'engineering',
          'Medical': 'medical',
          'Business Studies': 'business_studies',
          'Accounting': 'accounting',
          'Political Science': 'political_science',
          'Sociology': 'sociology',
          'Philosophy': 'philosophy',
          'Statistics': 'statistics',
          'Data Science': 'data_science',
          'Marketing': 'marketing',
          'Finance': 'finance',
          'Law': 'law',
          'Environmental Science': 'environmental_science',
          'Biotechnology': 'biotechnology',
          'Pharmaceutical': 'pharmaceutical',
          'Architecture': 'architecture'
        };

        const dbSubject = subjectMapping[lobby.subject] || lobby.subject.toLowerCase().replace(/\s+/g, '_');
        questionsQuery = questionsQuery.eq('subject', dbSubject);
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
    
    // Calculate score
    let score = 0;
    answers.forEach((answer, index) => {
      if (questions[index] && answer === questions[index].correct_answer) {
        score++;
      }
    });

    try {
      // Update participant score
      const { error } = await supabase
        .from('quiz_participants')
        .update({ 
          score,
          answers: answers 
        })
        .eq('lobby_id', lobby.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Quiz Completed!',
        description: `You scored ${score}/${questions.length} questions correctly.`,
      });
    } catch (error) {
      console.error('Error updating score:', error);
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
      questions[index] && answer === questions[index].correct_answer
    ).length;

    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Quiz Results
            </h1>
            <div className="text-6xl font-bold text-primary mb-4">
              {score}/{questions.length}
            </div>
            <p className="text-xl text-muted-foreground">
              {score >= questions.length * 0.8 ? 'Excellent work!' : 
               score >= questions.length * 0.6 ? 'Good job!' : 
               'Keep practicing!'}
            </p>
          </div>

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
                      {answers[index] === question.correct_answer ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </div>
                    <p className="mb-2">{question.question}</p>
                    <div className="text-sm">
                      <p>Your answer: <span className={answers[index] === question.correct_answer ? 'text-green-600' : 'text-red-600'}>{answers[index]}</span></p>
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
              {['a', 'b', 'c', 'd'].map((option) => (
                <Button
                  key={option}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className={`w-full text-left justify-start p-4 h-auto ${
                    selectedAnswer === option ? 'bg-gradient-primary text-white' : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <span className="font-semibold mr-3">{option.toUpperCase()}.</span>
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