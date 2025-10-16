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

interface Subject {
  id: string;
  name: string;
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSavedQuestions, setShowSavedQuestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { toast } = useToast();

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      
      // Fetch all branches from database
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name, simple_id, exam_simple_id')
        .order('name');

      if (branchesError) throw branchesError;

      // Add "General" branch at the beginning (same as Quiz Practice Lobby)
      const generalBranch: Branch = {
        id: 'general',
        name: 'General',
        simple_id: 'general',
        exam_simple_id: 'general',
        questionCount: 0
      };

      // Get question counts for each branch
      const branchesWithCounts = await Promise.all(
        (branchesData || []).map(async (branch) => {
          // Get all subjects for this exam
          const { data: subjects } = await supabase
            .from('subjects_hierarchy')
            .select('id')
            .eq('exam_simple_id', branch.exam_simple_id);

          if (!subjects || subjects.length === 0) {
            return { ...branch, questionCount: 0 };
          }

          const subjectIds = subjects.map(s => s.id);
          
          // Get all topics for these subjects
          const { data: topicsData } = await supabase
            .from('topics')
            .select('id')
            .in('subject_id', subjectIds);

          if (!topicsData || topicsData.length === 0) {
            return { ...branch, questionCount: 0 };
          }

          const topicIds = topicsData.map(t => t.id);
          
          // Count all questions available for these topics
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .in('topic_id', topicIds);

          return { ...branch, questionCount: count || 0 };
        })
      );

      // Count questions for General branch
      const generalSubjectNames = ['Biology', 'Chemistry', 'Physics', 'Quantitative Aptitude', 'Reasoning Ability'];
      const { data: generalSubjects } = await supabase
        .from('subjects_hierarchy')
        .select('id')
        .in('name', generalSubjectNames)
        .is('exam_simple_id', null);

      if (generalSubjects && generalSubjects.length > 0) {
        const generalSubjectIds = generalSubjects.map(s => s.id);
        const { data: generalTopics } = await supabase
          .from('topics')
          .select('id')
          .in('subject_id', generalSubjectIds);

        if (generalTopics && generalTopics.length > 0) {
          const generalTopicIds = generalTopics.map(t => t.id);
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .in('topic_id', generalTopicIds);
          
          generalBranch.questionCount = count || 0;
        }
      }

      // Combine General branch with other branches
      setBranches([generalBranch, ...branchesWithCounts]);
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

  const loadSubjectsForBranch = async (branch: Branch) => {
    try {
      setLoading(true);
      
      // Define general subject names that should ONLY appear in General branch
      const generalSubjectNames = ['Biology', 'Chemistry', 'Physics', 'Quantitative Aptitude', 'Reasoning Ability'];
      
      // For "General" branch, load specific general subjects (same as Quiz Practice Lobby)
      if (branch.exam_simple_id === 'general' || branch.simple_id === 'general') {
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects_hierarchy')
          .select('id, name, exam_simple_id, simple_id')
          .in('name', generalSubjectNames)
          .is('exam_simple_id', null)
          .order('name');

        if (subjectsError) throw subjectsError;

        // Get question counts for each subject
        const subjectsWithCounts = await Promise.all(
          (subjectsData || []).map(async (subject) => {
            const { data: topicsData } = await supabase
              .from('topics')
              .select('id')
              .eq('subject_id', subject.id);

            if (!topicsData || topicsData.length === 0) {
              return { ...subject, questionCount: 0 };
            }

            const topicIds = topicsData.map(t => t.id);
            const { count } = await supabase
              .from('quiz_questions')
              .select('*', { count: 'exact', head: true })
              .in('topic_id', topicIds);

            return { ...subject, questionCount: count || 0 };
          })
        );

        setSubjects(subjectsWithCounts);
        setCurrentPage(1);
        setLoading(false);
        return;
      }
      
      // For specific branches, load exam-specific subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects_hierarchy')
        .select('id, name, exam_simple_id, simple_id')
        .eq('exam_simple_id', branch.exam_simple_id)
        .order('name');

      if (subjectsError) throw subjectsError;

      // Filter out general subjects - they should ONLY appear in General branch
      const filteredSubjects = (subjectsData || []).filter(
        subject => !generalSubjectNames.includes(subject.name)
      );

      const subjectsWithCounts = await Promise.all(
        filteredSubjects.map(async (subject) => {
          const { data: topicsData } = await supabase
            .from('topics')
            .select('id')
            .eq('subject_id', subject.id);

          if (!topicsData || topicsData.length === 0) {
            return { ...subject, questionCount: 0 };
          }

          const topicIds = topicsData.map(t => t.id);
          const { count } = await supabase
            .from('quiz_questions')
            .select('*', { count: 'exact', head: true })
            .in('topic_id', topicIds);

          return { ...subject, questionCount: count || 0 };
        })
      );

      setSubjects(subjectsWithCounts);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTopicsForSubject = async (subject: Subject) => {
    try {
      setLoading(true);
      
      // Fetch all topics for this subject (reusing Quiz Practice Lobby data source)
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subject.id)
        .order('name');

      if (topicsError) throw topicsError;

      // Get question counts for each topic (showing all questions present)
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

      // Show all topics with their question counts
      setTopics(topicsWithCounts);
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Determine current items based on selection state
  const currentItems = selectedSubject 
    ? topics.slice(indexOfFirstItem, indexOfLastItem)
    : selectedBranch
    ? subjects.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  
  const totalPages = selectedSubject 
    ? Math.ceil(topics.length / itemsPerPage)
    : selectedBranch
    ? Math.ceil(subjects.length / itemsPerPage)
    : 0;

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => {
              if (selectedSubject) {
                setSelectedSubject(null);
              } else if (selectedBranch) {
                setSelectedBranch(null);
              } else {
                onBack();
              }
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              {selectedSubject 
                ? selectedSubject.name 
                : selectedBranch 
                ? selectedBranch.name 
                : 'Practice Lobby'}
            </h1>
            <p className="text-muted-foreground">
              {selectedSubject 
                ? 'Choose a topic to practice' 
                : selectedBranch 
                ? 'Select a subject to continue'
                : 'Select a branch to start practicing'}
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
        ) : selectedSubject ? (
          // Topics View
          <>
            {topics.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Topics Available</h3>
                  <p className="text-muted-foreground">
                    There are no practice questions available for this subject yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                  {currentItems.map((topic) => (
                    <Card
                      key={topic.id}
                      className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
                      onClick={() => setSelectedTopic(topic as Topic)}
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
        ) : selectedBranch ? (
          // Subjects View
          <>
            {subjects.length === 0 ? (
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Subjects Available</h3>
                  <p className="text-muted-foreground">
                    There are no practice questions available for this branch yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
                  {currentItems.map((subject) => (
                    <Card
                      key={subject.id}
                      className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
                      onClick={() => {
                        setSelectedSubject(subject as Subject);
                        loadTopicsForSubject(subject as Subject);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="group-hover:text-primary transition-colors">
                            {subject.name}
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            {subject.questionCount} Questions
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
                        loadSubjectsForBranch(branch);
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
