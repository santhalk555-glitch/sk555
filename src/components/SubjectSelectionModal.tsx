import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, BookOpen, Users, Crown, GraduationCap, Trophy, Target, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { COMPETITIVE_EXAM_OPTIONS, RRB_JE_ENGINEERING_BRANCHES } from '@/constants/profileOptions';

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectSelect: (selectionData: {
    sourceType: 'course' | 'exam';
    courseId?: string;
    examId?: string;
    branchId: string;
    subjectId: string;
    topicId?: string;
    maxPlayers: 1 | 2 | 4;
    lobbyType: 'quiz' | 'practice';
  }) => void;
}

interface ExamOption {
  name: string;
}

interface Branch {
  id: string;
  name: string;
  source_type: 'course' | 'exam';
  course_id?: string;
  exam_id?: string;
}

interface Subject {
  id: string;
  name: string;
  branch_id: string;
}

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

const SubjectSelectionModal = ({ isOpen, onClose, onSubjectSelect }: SubjectSelectionModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [examOptions, setExamOptions] = useState<ExamOption[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedLobbyType, setSelectedLobbyType] = useState<'quiz' | 'practice' | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamOption | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<2 | 4 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const loadOptions = () => {    
    // Load exam options from the same source as ProfileCreationForm
    const exams = COMPETITIVE_EXAM_OPTIONS.map(name => ({ name }));
    setExamOptions(exams);
  };

  const fetchBranches = async (sourceType: 'course' | 'exam', selectedName: string) => {
    try {
      setLoading(true);
      
      // Special handling for RRB JE - show engineering branches as branches
      if (sourceType === 'exam' && selectedName === 'RRB JE') {
        const rrb_je_branches = Object.keys(RRB_JE_ENGINEERING_BRANCHES).map((branch, index) => ({
          id: `rrb_je_${index}`,
          name: branch,
          source_type: 'exam' as const,
          exam_id: 'rrb_je'
        }));
        setBranches(rrb_je_branches);
        setLoading(false);
        return;
      }
      
      // Find matching course/exam in database by name
      let sourceId: string | null = null;
      
      if (sourceType === 'course') {
        const { data: courseData } = await supabase
          .from('courses')
          .select('simple_id')
          .eq('name', selectedName)
          .maybeSingle();
        sourceId = courseData?.simple_id || null;
      } else {
        const { data: examData } = await supabase
          .from('competitive_exams_list')
          .select('simple_id')
          .eq('name', selectedName)
          .maybeSingle();
        sourceId = examData?.simple_id || null;
      }

      if (!sourceId) {
        // If no matching record found, show empty branches
        setBranches([]);
        return;
      }

      const query = supabase
        .from('branches')
        .select('*')
        .eq('source_type', sourceType);
      
      if (sourceType === 'course') {
        query.eq('course_simple_id', sourceId);
      } else {
        query.eq('exam_simple_id', sourceId);
      }

      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      // Type cast the data to ensure proper typing
      const typedBranches = (data || []).map(branch => ({
        ...branch,
        source_type: branch.source_type as 'course' | 'exam'
      }));
      
      setBranches(typedBranches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (branchId: string) => {
    try {
      setLoading(true);
      
      // Special handling for RRB JE engineering branches - show detailed subjects
      if (branchId.startsWith('rrb_je_') && selectedExam?.name === 'RRB JE') {
        const branchIndex = parseInt(branchId.replace('rrb_je_', ''));
        const branchName = Object.keys(RRB_JE_ENGINEERING_BRANCHES)[branchIndex];
        const branchSubjects = RRB_JE_ENGINEERING_BRANCHES[branchName as keyof typeof RRB_JE_ENGINEERING_BRANCHES];
        
        const rrb_je_subjects = branchSubjects.map((subject, index) => ({
          id: `${branchId}_subject_${index}`,
          name: subject,
          branch_id: branchId
        }));
        
        setSubjects(rrb_je_subjects);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, simple_id, branch_id')
        .eq('branch_id', branchId)
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (subjectId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('topics')
        .select('id, name, subject_id, simple_id')
        .eq('subject_id', subjectId)
        .order('name');
      
      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load topics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLobbyTypeSelect = (lobbyType: 'quiz' | 'practice') => {
    setSelectedLobbyType(lobbyType);
    setCurrentStep(2);
  };

  const handleExamSelect = (exam: ExamOption) => {
    setSelectedExam(exam);
    fetchBranches('exam', exam.name);
    setCurrentStep(3);
  };

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    fetchSubjects(branch.id);
    setCurrentStep(4);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    
    if (selectedLobbyType === 'practice') {
      // For practice lobbies, fetch topics for detailed selection
      fetchTopics(subject.id);
      setCurrentStep(5);
    } else {
      // For quiz lobbies, skip topic selection and go to player count
      setCurrentStep(6);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentStep(6);
  };

  const handleCreate = async () => {
    if (!selectedBranch || !selectedSubject || !selectedLobbyType) return;
    
    // For practice lobbies, topic is required
    if (selectedLobbyType === 'practice' && !selectedTopic) return;
    
    // For quiz lobbies, player count is required
    if (selectedLobbyType === 'quiz' && !selectedPlayers) return;

    // Get the actual database IDs for exam
    let examId: string | undefined;
    
    if (selectedExam) {
      const { data: examData } = await supabase
        .from('competitive_exams_list')
        .select('simple_id')
        .eq('name', selectedExam.name)
        .maybeSingle();
      examId = examData?.simple_id;
    }
    
    // Store RRB JE subject name for later use in lobby creation
    if (selectedSubject && selectedSubject.id.includes('rrb_je_')) {
      sessionStorage.setItem(`rrb_je_subject_${selectedSubject.id}`, selectedSubject.name);
    }
    
    onSubjectSelect({
      sourceType: 'exam',
      examId,
      branchId: selectedBranch.id,
      subjectId: selectedSubject.id,
      topicId: selectedTopic?.id,
      maxPlayers: selectedLobbyType === 'practice' ? 1 : (selectedPlayers || 2),
      lobbyType: selectedLobbyType
    });
    resetModal();
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedLobbyType(null);
    setSelectedExam(null);
    setSelectedBranch(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedPlayers(null);
    setBranches([]);
    setSubjects([]);
    setTopics([]);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      
      // Reset subsequent selections
      if (currentStep === 2) {
        setSelectedLobbyType(null);
      } else if (currentStep === 3) {
        setSelectedExam(null);
        setBranches([]);
      } else if (currentStep === 4) {
        setSelectedBranch(null);
        setSubjects([]);
      } else if (currentStep === 5) {
        setSelectedSubject(null);
        setTopics([]);
      } else if (currentStep === 6) {
        if (selectedLobbyType === 'practice') {
          setSelectedTopic(null);
        } else {
          setSelectedSubject(null);
          setTopics([]);
        }
        setSelectedPlayers(null);
      }
    }
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    const totalSteps = selectedLobbyType === 'practice' ? 6 : 5;
    return `Create ${selectedLobbyType?.charAt(0).toUpperCase() + selectedLobbyType?.slice(1) || ''} Lobby - Step ${currentStep} of ${totalSteps}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            {getStepTitle()}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Lobby Type Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2 text-primary" />
                Step 1: Choose Lobby Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary/30"
                  onClick={() => handleLobbyTypeSelect('quiz')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">Quiz Lobby</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Multiplayer competitive quiz sessions
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p>• Exam → Subject</p>
                      <p>• All topics included</p>
                      <p>• 2-4 players</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary/30"
                  onClick={() => handleLobbyTypeSelect('practice')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">Practice Lobby</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Single player focused learning
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <p>• Exam → Subject → Topic</p>
                      <p>• Specific topic only</p>
                      <p>• Single player</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Exam Selection */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                Step 2: Choose Competitive Exam
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                {examOptions.map((exam, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:border-primary/30"
                    onClick={() => handleExamSelect(exam)}
                  >
                    {exam.name}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Back
              </Button>
            </div>
          )}

          {/* Step 3: Branch Selection */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Step 3: Choose Branch
              </h3>
              {loading ? (
                <p className="text-center text-muted-foreground">Loading branches...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {branches.map((branch) => (
                    <Badge
                      key={branch.id}
                      variant="outline"
                      className="p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:border-primary/30"
                      onClick={() => handleBranchSelect(branch)}
                    >
                      {branch.name}
                    </Badge>
                  ))}
                </div>
              )}
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Back
              </Button>
            </div>
          )}

          {/* Step 4: Subject Selection */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Step 4: Choose Subject
              </h3>
              {loading ? (
                <p className="text-center text-muted-foreground">Loading subjects...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map((subject) => (
                    <Badge
                      key={subject.id}
                      variant="outline"
                      className="p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:border-primary/30"
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      {subject.name}
                    </Badge>
                  ))}
                </div>
              )}
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Back
              </Button>
            </div>
          )}

          {/* Step 5: Topic Selection (Practice only) */}
          {currentStep === 5 && selectedLobbyType === 'practice' && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Step 5: Choose Topic
              </h3>
              {loading ? (
                <p className="text-center text-muted-foreground">Loading topics...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {topics.map((topic) => (
                    <Badge
                      key={topic.id}
                      variant="outline"
                      className="p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:border-primary/30"
                      onClick={() => handleTopicSelect(topic)}
                    >
                      {topic.name}
                    </Badge>
                  ))}
                </div>
              )}
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Back
              </Button>
            </div>
          )}

          {/* Step 6: Final Step */}
          {currentStep === 6 && (
            <div>
              {selectedLobbyType === 'quiz' ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Step 5: Choose Lobby Size
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedPlayers === 2 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => setSelectedPlayers(2)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold mb-2">2-Player Lobby</h4>
                        <p className="text-sm text-muted-foreground">
                          Perfect for focused 1-on-1 sessions
                        </p>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedPlayers === 4 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => setSelectedPlayers(4)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center mx-auto mb-3">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold mb-2">4-Player Lobby</h4>
                        <p className="text-sm text-muted-foreground">
                          Great for group sessions and team challenges
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary" />
                    Step 6: Ready to Practice
                  </h3>
                  <Card className="border-primary bg-primary/10">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold mb-2">Practice Session Ready</h4>
                      <p className="text-sm text-muted-foreground">
                        Single player practice session for focused learning
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                
                {((selectedLobbyType === 'quiz' && selectedPlayers) || (selectedLobbyType === 'practice' && selectedTopic)) && (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Creating lobby for:</p>
                      <p className="font-semibold text-sm">
                        {selectedSubject?.name}
                        {selectedTopic && ` → ${selectedTopic.name}`}
                        {' • '}
                        {selectedLobbyType === 'quiz' ? '🏆 Quiz' : '🎯 Practice'}
                        {' • '}
                        {selectedLobbyType === 'quiz' ? `${selectedPlayers} Players` : 'Single Player'}
                      </p>
                    </div>
                    <Button 
                      onClick={handleCreate}
                      className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg"
                    >
                      Create Lobby
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectSelectionModal;