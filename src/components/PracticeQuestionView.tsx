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
  const [totalCount, setTotalCount] = useState(0);
  const questionsPerPage = 20;
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTotalCount();
    loadQuestions();
    loadSavedQuestions();
  }, [topicId, savedOnly]);

  const fetchTotalCount = async () => {
    try {
      if (savedOnly) {
        const { count, error } = await supabase
          .from('saved_questions')
          .select('question_id', { count: 'exact', head: true })
          .eq('user_id', user?.id);

        if (error) throw error;
        setTotalCount(count || 0);
      } else {
        const { count, error } = await supabase
          .from('quiz_questions')
          .select('id', { count: 'exact', head: true })
          .eq('topic_id', topicId);

        if (error) throw error;
        setTotalCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching total count:', error);
      setTotalCount(0);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      
      if (savedOnly) {
        // Load saved questions in batches to avoid 1000-row cap
        // First, fetch all saved question IDs in 1000-sized pages
        let allSavedIds: string[] = [];
        let fetched = 0;
        const total = totalCount;
        while (fetched < total) {
          const start = fetched;
          const end = Math.min(fetched + 999, total - 1);
          const { data: savedIdsPage, error: savedIdsError } = await supabase
            .from('saved_questions')
            .select('question_id')
            .eq('user_id', user?.id)
            .range(start, end);

          if (savedIdsError) throw savedIdsError;
          const pageIds = (savedIdsPage || []).map(sq => sq.question_id);
          allSavedIds = allSavedIds.concat(pageIds);
          fetched += pageIds.length;
          if (pageIds.length === 0) break; // safety
        }

        if (allSavedIds.length === 0) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        // Fetch questions in chunks of up to 1000 IDs
        const allQuestions: Question[] = [];
        for (let i = 0; i < allSavedIds.length; i += 1000) {
          const chunk = allSavedIds.slice(i, i + 1000);
          const { data: chunkQuestions, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .in('id', chunk)
            .order('created_at');
          if (questionsError) throw questionsError;
          allQuestions.push(...(chunkQuestions || []));
        }

        setQuestions(allQuestions);
      } else {
        // Load all questions for topic in 1000-sized batches
        const total = totalCount;
        const allQuestions: Question[] = [];
        for (let start = 0; start < total; start += 1000) {
          const end = Math.min(start + 999, total - 1);
          const { data: questionsData, error: questionsError } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('topic_id', topicId)
            .order('created_at')
            .range(start, end);

          if (questionsError) throw questionsError;
          allQuestions.push(...(questionsData || []));
        }
        setQuestions(allQuestions);
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

  const totalPages = Math.ceil(totalCount / questionsPerPage);
  const startQuestion = currentPage * questionsPerPage;
  const endQuestion = Math.min(startQuestion + questionsPerPage, totalCount);
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
    <div className="pt-20 pb-12 font-poppins">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center flex-1 min-w-[200px]">
            <h2 className="text-xl md:text-2xl font-bold text-primary">{topicName}</h2>
            <p className="text-sm text-muted-foreground">{totalCount} Questions Available</p>
          </div>

          <Button
            variant={isSaved ? "default" : "outline"}
            onClick={() => handleSaveQuestion(currentQuestion.id)}
            className={`gap-2 transition-all duration-200 ${isSaved ? 'bg-primary' : 'hover:bg-blue-50'}`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Saved</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {totalCount}
            </span>
            <span className="text-sm font-semibold text-primary">
              {totalCount > 0 ? Math.round(((currentQuestionIndex + 1) / totalCount) * 100) : 0}% Complete
            </span>
          </div>
          <Progress value={totalCount > 0 ? ((currentQuestionIndex + 1) / totalCount) * 100 : 0} className="h-3 bg-blue-100" />
        </div>

        {/* Question Navigation with Pagination */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 hover:bg-blue-50 disabled:opacity-40"
              >
                ←
              </Button>
              <span className="text-sm font-medium text-muted-foreground min-w-[120px] text-center">
                Showing {startQuestion + 1}-{endQuestion}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 hover:bg-blue-50 disabled:opacity-40"
              >
                →
              </Button>
            </div>
            
            <div className="overflow-x-auto pb-2 px-2 -mx-2">
              <div className="flex gap-2 min-w-min px-1">
                {visibleQuestions.map((_, idx) => {
                  const absoluteIndex = startQuestion + idx;
                  return (
                    <Button
                      key={absoluteIndex}
                      variant={absoluteIndex === currentQuestionIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuestionSelect(absoluteIndex)}
                      className={`min-w-[40px] transition-all duration-200 flex-shrink-0 ${
                        absoluteIndex === currentQuestionIndex 
                          ? 'bg-primary scale-105 shadow-md' 
                          : 'hover:border-primary/50 hover:bg-blue-50'
                      }`}
                    >
                      {absoluteIndex + 1}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Page indicator dots */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {Array.from({ length: Math.min(totalPages, 10) }).map((_, idx) => {
                  const pageIdx = totalPages <= 10 ? idx : Math.floor((idx / 10) * totalPages);
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageIdx)}
                      className={`h-2 rounded-full transition-all duration-200 ${
                        currentPage === pageIdx 
                          ? 'bg-primary w-6' 
                          : 'bg-muted-foreground/30 hover:bg-primary/50 w-2'
                      }`}
                      aria-label={`Go to page ${pageIdx + 1}`}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Card with smooth animation */}
        <Card className="mb-6 bg-white shadow-lg border-primary/10 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary" className="bg-primary text-white px-3 py-1">
                Question {currentQuestionIndex + 1}
              </Badge>
              {showAnswer && (
                <Badge 
                  variant="secondary" 
                  className={isCorrect ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}
                >
                  {isCorrect ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">
              <div className="space-y-3">
                <div className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
                  {currentQuestion.question}
                </div>
                {currentQuestion.question_hindi && (
                  <div className="text-base md:text-lg text-muted-foreground font-normal leading-relaxed">
                    {currentQuestion.question_hindi}
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {[1, 2, 3, 4].map((optionNum) => {
              const optionKey = `option_${optionNum}` as keyof Question;
              const optionHindiKey = `option_${optionNum}_hindi` as keyof Question;
              const isSelected = selectedAnswer === optionNum;
              const isCorrectOption = currentQuestion.correct_answer === optionNum;
              
              let buttonClass = "w-full justify-start text-left h-auto py-4 md:py-5 transition-all duration-200";
              let buttonVariant: "outline" | "default" | "destructive" = "outline";
              
              if (showAnswer) {
                if (isCorrectOption) {
                  buttonClass += " bg-green-50 border-green-400 hover:bg-green-100";
                } else if (isSelected && !isCorrect) {
                  buttonClass += " bg-red-50 border-red-400 hover:bg-red-100";
                }
              } else {
                if (isSelected) {
                  buttonVariant = "default";
                  buttonClass += " bg-primary text-white shadow-md scale-[1.02]";
                } else {
                  buttonClass += " hover:border-primary/50 hover:bg-blue-50/50 hover:scale-[1.01]";
                }
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
                    <Badge 
                      variant={isSelected && !showAnswer ? "secondary" : "outline"}
                      className={`mt-1 w-8 h-8 flex items-center justify-center rounded-full ${
                        isSelected && !showAnswer ? 'bg-white text-primary' : ''
                      } ${showAnswer && isCorrectOption ? 'bg-green-100 text-green-700 border-green-400' : ''}`}
                    >
                      {optionNum}
                    </Badge>
                    <div className="flex-1 text-left">
                      <div className="text-sm md:text-base font-medium">
                        {currentQuestion[optionKey] as string}
                      </div>
                      {currentQuestion[optionHindiKey] && (
                        <div className={`text-sm mt-1 ${isSelected && !showAnswer ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {currentQuestion[optionHindiKey] as string}
                        </div>
                      )}
                    </div>
                    {showAnswer && isCorrectOption && (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    )}
                    {showAnswer && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-2 order-2 sm:order-1">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              size="lg"
              className="flex-1 sm:flex-initial bg-white hover:bg-blue-50 border-primary/20 disabled:opacity-40"
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              size="lg"
              className="flex-1 sm:flex-initial bg-white hover:bg-blue-50 border-primary/20 disabled:opacity-40"
            >
              Next →
            </Button>
            <ReportQuestionDialog 
              questionId={currentQuestion.id}
              questionText={currentQuestion.question}
            />
          </div>
          
          <div className="flex gap-3 order-1 sm:order-2">
            {!showAnswer ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={selectedAnswer === null}
                className="gap-2 flex-1 sm:flex-initial bg-primary hover:bg-primary/90 shadow-md disabled:opacity-40"
                size="lg"
              >
                Check Answer
              </Button>
            ) : (
              <>
                {currentQuestionIndex < questions.length - 1 && (
                  <Button
                    onClick={handleNextQuestion}
                    className="gap-2 flex-1 sm:flex-initial bg-primary hover:bg-primary/90 shadow-md"
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
          <Card className={`mt-6 animate-fade-in ${isCorrect ? 'border-green-400 bg-green-50/50' : 'border-red-400 bg-red-50/50'}`}>
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
