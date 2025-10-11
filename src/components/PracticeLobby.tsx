import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Star, ChevronRight, Zap, Cpu, Wrench, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PracticeQuestionView from './PracticeQuestionView';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface PracticeLobbyProps {
  onBack: () => void;
}

interface Branch {
  id: string;
  name: string;
  simple_id: string;
  exam_simple_id: string;
  questionCount: number;
}

interface Topic {
  id: string;
  name: string;
  simple_id: string;
  subject_id: string;
  questionCount: number;
}

const PracticeLobby = ({ onBack }: PracticeLobbyProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSavedQuestions, setShowSavedQuestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 20;
  const { toast } = useToast();

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (branchesError) throw branchesError;

      // Get question counts for each branch
      const branchesWithCounts = await Promise.all(
        (branchesData || []).map(async (branch) => {
          // Count questions via subjects and topics
          const { data: subjects } = await supabase
            .from('subjects_hierarchy')
            .select('id')
            .eq('exam_simple_id', branch.exam_simple_id);

          if (!subjects || subjects.length === 0) {
            return { ...branch, questionCount: 0 };
          }

          const subjectIds = subjects.map(s => s.id);
          
          const { data: topicsData } = await supabase
            .from('topics')
            .select('id')
            .in('subject_id', subjectIds);

          if (!topicsData || topicsData.length === 0) {
            return { ...branch, questionCount: 0 };
          }

          const topicIds = topicsData.map(t => t.id);
          
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .in('topic_id', topicIds);

          return { ...branch, questionCount: count || 0 };
        })
      );

      const branchesWithQuestions = branchesWithCounts.filter(b => b.questionCount > 0);
      setBranches(branchesWithQuestions);
    } catch (error) {
      console.error('Error loading branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTopicsForBranch = async (branch: Branch) => {
    try {
      setLoading(true);
      
      // Get subjects for this branch
      const { data: subjects } = await supabase
        .from('subjects_hierarchy')
        .select('id')
        .eq('exam_simple_id', branch.exam_simple_id);

      if (!subjects || subjects.length === 0) {
        setTopics([]);
        return;
      }

      const subjectIds = subjects.map(s => s.id);
      
      // Get topics for these subjects
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .in('subject_id', subjectIds)
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

      const topicsWithQuestions = topicsWithCounts.filter(t => t.questionCount > 0);
      setTopics(topicsWithQuestions);
      setCurrentPage(1);
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

  const getBranchIcon = (branchName: string) => {
    const name = branchName.toLowerCase();
    if (name.includes('electrical') || name.includes('electronics')) return Zap;
    if (name.includes('computer') || name.includes('it')) return Cpu;
    if (name.includes('mechanical')) return Wrench;
    if (name.includes('civil')) return Building2;
    return BookOpen;
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

  // Pagination logic for topics
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(topics.length / topicsPerPage);

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={selectedBranch ? () => setSelectedBranch(null) : onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              {selectedBranch ? selectedBranch.name : 'Practice Lobby'}
            </h1>
            <p className="text-muted-foreground">
              {selectedBranch ? 'Choose a topic to practice' : 'Select a branch to start practicing'}
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

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : selectedBranch ? (
          // Topics View
          <>
            {topics.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Topics Available</h3>
                  <p className="text-muted-foreground">
                    There are no practice questions available for this branch yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                  {currentTopics.map((topic) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </>
        ) : (
          // Branches View
          <>
            {branches.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Branches Available</h3>
                  <p className="text-muted-foreground">
                    There are no practice questions available yet. Check back later!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {branches.map((branch) => {
                  const BranchIcon = getBranchIcon(branch.name);
                  return (
                    <Card
                      key={branch.id}
                      className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
                      onClick={() => {
                        setSelectedBranch(branch);
                        loadTopicsForBranch(branch);
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <BranchIcon className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="group-hover:text-primary transition-colors">
                            {branch.name}
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="gap-2">
                          <BookOpen className="w-4 h-4" />
                          {branch.questionCount} Questions
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeLobby;
