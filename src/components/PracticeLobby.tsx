import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Star, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PracticeQuestionView from './PracticeQuestionView';

interface PracticeLobbyProps {
  onBack: () => void;
}

interface Topic {
  id: string;
  name: string;
  simple_id: string;
  subject_id: string;
  questionCount: number;
}

const PracticeLobby = ({ onBack }: PracticeLobbyProps) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSavedQuestions, setShowSavedQuestions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      
      // Fetch all topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .order('name');

      if (topicsError) throw topicsError;

      // Get question counts for each topic
      const topicsWithCounts = await Promise.all(
        (topicsData || []).map(async (topic) => {
          const { count, error } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

          if (error) console.error('Error counting questions for topic:', topic.name, error);

          return {
            ...topic,
            questionCount: count || 0
          };
        })
      );

      // Filter out topics with no questions
      const topicsWithQuestions = topicsWithCounts.filter(t => t.questionCount > 0);
      setTopics(topicsWithQuestions);
    } catch (error) {
      console.error('Error loading topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (showSavedQuestions) {
    return (
      <PracticeQuestionView
        topicId={null}
        topicName="Saved Questions"
        savedOnly={true}
        onBack={() => setShowSavedQuestions(false)}
      />
    );
  }

  if (selectedTopic) {
    return (
      <PracticeQuestionView
        topicId={selectedTopic.id}
        topicName={selectedTopic.name}
        savedOnly={false}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Practice Lobby
            </h1>
            <p className="text-muted-foreground">
              Choose a topic to practice
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowSavedQuestions(true)}
            className="gap-2"
          >
            <Star className="w-4 h-4 fill-current text-gaming-warning" />
            Saved Questions
          </Button>
        </div>

        {/* Topics Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Topics Available</h3>
              <p className="text-muted-foreground">
                There are no practice questions available yet. Check back later!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="group-hover:text-primary transition-colors">
                      {topic.name}
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      {topic.questionCount} Questions
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeLobby;
