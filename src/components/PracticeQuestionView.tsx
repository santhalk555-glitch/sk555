import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Star, CheckCircle, XCircle, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ReportQuestionDialog from './ReportQuestionDialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PracticeQuestionViewProps {
  topicId: string | null;
  topicName: string;
  savedOnly: boolean;
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

const PracticeQuestionView = ({ topicId, topicName, savedOnly, onBack }: PracticeQuestionViewProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 50;
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadQuestions();
    loadSavedQuestions();
  }, [topicId, savedOnly]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      if (savedOnly) {
        // Load saved questions
        const { data: savedData, error: savedError } = await supabase
          .from('saved_questions')
          .select('question_id')
          .eq('user_id', user?.id);

        if (savedError) throw savedError;

        const questionIds = savedData?.map(sq => sq.question_id) || [];
        
        if (questionIds.length === 0) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .in('id', questionIds);

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } else {
        // Load questions for topic
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('topic_id', topicId)
          .order('created_at');

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedQuestions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_questions')
        .select('question_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedQuestionIds(new Set(data?.map(sq => sq.question_id) || []));
    } catch (error) {
      console.error('Error loading saved questions:', error);
    }
  };

  const handleSaveQuestion = async (questionId: string) => {
    if (!user) return;

    const isSaved = savedQuestionIds.has(questionId);

    try {
      if (isSaved) {
        // Unsave question
        const { error } = await supabase
          .from('saved_questions')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId);

        if (error) throw error;

        setSavedQuestionIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(questionId);
          return newSet;
        });

        toast({
          title: 'Removed',
          description: 'Question removed from saved list'
        });

        // If we're viewing saved questions and unsaved this one, reload
        if (savedOnly) {
          await loadQuestions();
          if (currentQuestionIndex >= questions.length - 1) {
            setCurrentQuestionIndex(Math.max(0, questions.length - 2));
          }
        }
      } else {
        // Save question
        const { error } = await supabase
          .from('saved_questions')
          .insert({
            user_id: user.id,
            question_id: questionId
          });

        if (error) throw error;

        setSavedQuestionIds(prev => new Set(prev).add(questionId));

        toast({
          title: 'Saved!',
          description: 'Question saved for later review'
        });
      }
    } catch (error) {
      console.error('Error toggling saved question:', error);
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive'
      });
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswer(null);
    setShowAnswer(false);
    // Update pagination to show the selected question
    setCurrentPage(Math.floor(index / questionsPerPage));
  };

  const handleAnswerSelect = (optionNum: number) => {
    setSelectedAnswer(optionNum);
  };

  const handleCheckAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setShowAnswer(false);
      // Auto-update page if moving to next page
      setCurrentPage(Math.floor(nextIndex / questionsPerPage));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedAnswer(null);
      setShowAnswer(false);
      // Auto-update page if moving to previous page
      setCurrentPage(Math.floor(prevIndex / questionsPerPage));
    }
  };

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startQuestion = currentPage * questionsPerPage;
  const endQuestion = Math.min(startQuestion + questionsPerPage, questions.length);
  const visibleQuestions = questions.slice(startQuestion, endQuestion);

  if (loading) {
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No questions available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;
  const isSaved = savedQuestionIds.has(currentQuestion.id);

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold">{topicName}</h2>
            <p className="text-muted-foreground">{questions.length} Questions</p>
          </div>

          <Button
            variant={isSaved ? "default" : "outline"}
            onClick={() => handleSaveQuestion(currentQuestion.id)}
            className="gap-2"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                Save
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
        </div>

        {/* Question Navigation with Pagination */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3"
              >
                ←
              </Button>
              <span className="text-sm text-muted-foreground min-w-[120px] text-center">
                {startQuestion + 1}-{endQuestion} of {questions.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3"
              >
                →
              </Button>
            </div>
            
            <ScrollArea className="pb-2">
              <div className="flex gap-2">
                {visibleQuestions.map((_, idx) => {
                  const absoluteIndex = startQuestion + idx;
                  return (
                    <Button
                      key={absoluteIndex}
                      variant={absoluteIndex === currentQuestionIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuestionSelect(absoluteIndex)}
                      className="min-w-[40px] transition-all duration-200 flex-shrink-0"
                    >
                      {absoluteIndex + 1}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
            
            {/* Page indicator dots */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: Math.min(totalPages, 10) }).map((_, idx) => {
                  const pageIdx = totalPages <= 10 ? idx : Math.floor((idx / 10) * totalPages);
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageIdx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentPage === pageIdx 
                          ? 'bg-primary w-4' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Go to page ${pageIdx + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl">
              <div className="mb-4">
                <div className="font-semibold text-foreground mb-2">
                  {currentQuestion.question}
                </div>
                {currentQuestion.question_hindi && (
                  <div className="text-base text-muted-foreground font-normal">
                    {currentQuestion.question_hindi}
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((optionNum) => {
              const optionKey = `option_${optionNum}` as keyof Question;
              const optionHindiKey = `option_${optionNum}_hindi` as keyof Question;
              const isSelected = selectedAnswer === optionNum;
              const isCorrectOption = currentQuestion.correct_answer === optionNum;
              
              let buttonVariant: "outline" | "default" | "destructive" = "outline";
              let buttonClass = "w-full justify-start text-left h-auto py-4 transition-all duration-200";
              
              if (showAnswer) {
                if (isCorrectOption) {
                  buttonClass += " bg-gaming-success/20 border-gaming-success hover:bg-gaming-success/30";
                } else if (isSelected && !isCorrect) {
                  buttonClass += " bg-destructive/20 border-destructive hover:bg-destructive/30";
                }
              } else if (isSelected) {
                buttonVariant = "default";
              }

              return (
                <Button
                  key={optionNum}
                  variant={buttonVariant}
                  onClick={() => !showAnswer && handleAnswerSelect(optionNum)}
                  disabled={showAnswer}
                  className={buttonClass}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Badge variant="secondary" className="mt-1">
                      {optionNum}
                    </Badge>
                    <div className="flex-1 text-left">
                      <div className="font-medium">
                        {currentQuestion[optionKey] as string}
                      </div>
                      {currentQuestion[optionHindiKey] && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {currentQuestion[optionHindiKey] as string}
                        </div>
                      )}
                    </div>
                    {showAnswer && isCorrectOption && (
                      <CheckCircle className="w-5 h-5 text-gaming-success flex-shrink-0" />
                    )}
                    {showAnswer && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                    )}
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              size="lg"
            >
              ← Previous
            </Button>
            <ReportQuestionDialog 
              questionId={currentQuestion.id}
              questionText={currentQuestion.question}
            />
          </div>
          
          <div className="flex gap-3">
            {!showAnswer ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className="gap-2"
                size="lg"
              >
                Check Answer
              </Button>
            ) : (
              <>
                {currentQuestionIndex < questions.length - 1 && (
                  <Button
                    onClick={handleNextQuestion}
                    className="gap-2"
                    size="lg"
                  >
                    Next Question →
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Answer Feedback */}
        {showAnswer && (
          <Card className={`mt-6 animate-fade-in ${isCorrect ? 'border-gaming-success' : 'border-destructive'}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-gaming-success" />
                    <div>
                      <p className="font-semibold text-gaming-success">Correct!</p>
                      <p className="text-sm text-muted-foreground">Well done! You got it right.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">Incorrect</p>
                      <p className="text-sm text-muted-foreground">
                        The correct answer is option {currentQuestion.correct_answer}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PracticeQuestionView;
