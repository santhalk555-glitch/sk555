import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, BookOpen, Users, Crown, GraduationCap, Trophy, Target, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { RRB_JE_ENGINEERING_BRANCHES } from '@/constants/profileOptions';

// Define exams with technical + general streams
const EXAMS_WITH_TECHNICAL_BRANCHES = [
  'RRB JE', 'RRB SSE', 'ISRO', 'DRDO', 'GATE', 'ESE/IES'
];

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
  exam_simple_id?: string;
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
  const [loading, setLoading] = useState(false);
  
  // Single state object to store all form data
  const [formData, setFormData] = useState({
    lobbyType: null as 'quiz' | 'practice' | null,
    exam: null as ExamOption | null,
    branch: null as Branch | null,
    subject: null as Subject | null,
    topic: null as Topic | null,
    players: null as 2 | 4 | null,
  });

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const loadOptions = async () => {    
    try {
      setLoading(true);
      // Fetch competitive exams dynamically from database
      const { data: examsData, error } = await supabase
        .from('competitive_exams_list')
        .select('name')
        .order('name');
      
      if (error) throw error;
      
      const exams = (examsData || []).map(exam => ({ name: exam.name }));
      setExamOptions(exams);
    } catch (error) {
      console.error('Error loading exam options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load exam options',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update form data helper
  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchBranches = async (sourceType: 'course' | 'exam', selectedName: string) => {
    try {
      setLoading(true);
      
      // Check if this exam has technical + general streams
      const hasTechnicalBranches = EXAMS_WITH_TECHNICAL_BRANCHES.includes(selectedName);
      
      if (sourceType === 'exam' && hasTechnicalBranches) {
        // For exams with technical branches (like RRB JE), show branch selection
        if (selectedName === 'RRB JE') {
          // Special handling for RRB JE - show engineering branches + General
          const rrb_je_branches = [
            ...Object.keys(RRB_JE_ENGINEERING_BRANCHES).map((branch, index) => ({
              id: `rrb_je_${index}`,
              name: branch,
              exam_simple_id: 'rrb_je'
            })),
            {
              id: 'rrb_je_general',
              name: 'General',
              exam_simple_id: 'rrb_je'
            }
          ];
          setBranches(rrb_je_branches);
          setLoading(false);
          return;
        }
        
        // For other technical exams, fetch from database
        const { data: examData } = await supabase
          .from('competitive_exams_list')
          .select('simple_id')
          .eq('name', selectedName)
          .maybeSingle();
        
        if (examData?.simple_id) {
          const { data, error } = await supabase
            .from('branches')
            .select('id, name, exam_simple_id')
            .eq('exam_simple_id', examData.simple_id)
            .order('name');
          
          if (error) throw error;
          
          setBranches(data || []);
        } else {
          setBranches([]);
        }
      } else {
        // For exams with only general subjects, fetch from database
        setBranches([]);
        await fetchSubjectsForExam(selectedName);
        setCurrentStep(4); // Skip branch selection, go directly to subject selection
      }
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

  const fetchSubjectsForExam = async (examName: string, isGeneralBranch: boolean = false) => {
    try {
      setLoading(true);
      
      // Get exam simple_id from database
      const { data: examData } = await supabase
        .from('competitive_exams_list')
        .select('simple_id')
        .eq('name', examName)
        .maybeSingle();
      
      if (!examData?.simple_id) {
        setSubjects([]);
        return;
      }
      
      // Fetch general subjects from subjects_hierarchy table
      // General subjects: Quantitative Aptitude, Reasoning Ability, Physics, Chemistry, Biology
      const { data, error } = await supabase
        .from('subjects_hierarchy')
        .select('id, name, simple_id, exam_simple_id')
        .eq('exam_simple_id', examData.simple_id)
        .order('name');
      
      if (error) throw error;
      
      const subjectsData = (data || []).map(s => ({
        id: s.id,
        name: s.name,
        branch_id: 'general'
      }));
      
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects for exam:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (branchId: string) => {
    try {
      setLoading(true);
      
      // Handle General branch - fetch general subjects from database
      if (branchId === 'rrb_je_general' || branchId === 'general') {
        if (formData.exam?.name) {
          await fetchSubjectsForExam(formData.exam.name, true);
        }
        setLoading(false);
        return;
      }
      
      // Handle RRB JE technical branches - show technical subjects
      if (branchId.startsWith('rrb_je_') && formData.exam?.name === 'RRB JE') {
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
      
      // For other branches, fetch from subjects_hierarchy table
      const { data: examData } = await supabase
        .from('competitive_exams_list')
        .select('simple_id')
        .eq('name', formData.exam?.name || '')
        .maybeSingle();
      
      if (!examData?.simple_id) {
        setSubjects([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('subjects_hierarchy')
        .select('id, name, simple_id')
        .eq('exam_simple_id', examData.simple_id)
        .order('name');
      
      if (error) throw error;
      
      const subjectsData = (data || []).map(s => ({
        id: s.id,
        name: s.name,
        branch_id: branchId
      }));
      
      setSubjects(subjectsData);
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
    updateFormData('lobbyType', lobbyType);
    setCurrentStep(2);
  };

  const handleExamSelect = (exam: ExamOption) => {
    updateFormData('exam', exam);
    
    // Check if this exam has technical branches or only general subjects
    const hasTechnicalBranches = EXAMS_WITH_TECHNICAL_BRANCHES.includes(exam.name);
    
    if (hasTechnicalBranches) {
      // Show branch selection for technical exams
      fetchBranches('exam', exam.name);
      setCurrentStep(3);
    } else {
      // Skip branch selection and go directly to general subjects
      fetchBranches('exam', exam.name); // This will skip to subjects automatically
    }
  };

  const handleBranchSelect = (branch: Branch) => {
    updateFormData('branch', branch);
    fetchSubjects(branch.id);
    setCurrentStep(4);
  };

  const handleSubjectSelect = (subject: Subject) => {
    updateFormData('subject', subject);
    
    if (formData.lobbyType === 'practice') {
      // For practice lobbies, fetch topics for detailed selection
      fetchTopics(subject.id);
      setCurrentStep(5);
    } else {
      // For quiz lobbies, skip topic selection and go to player count
      setCurrentStep(6);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    updateFormData('topic', topic);
    setCurrentStep(6);
  };
  
  const handlePlayersSelect = (players: 2 | 4) => {
    updateFormData('players', players);
  };

  const handleCreate = async () => {
    if (!formData.branch || !formData.subject || !formData.lobbyType) return;
    
    // For practice lobbies, topic is required
    if (formData.lobbyType === 'practice' && !formData.topic) return;
    
    // For quiz lobbies, player count is required
    if (formData.lobbyType === 'quiz' && !formData.players) return;

    // Get the actual database IDs for exam
    let examId: string | undefined;
    
    if (formData.exam) {
      const { data: examData } = await supabase
        .from('competitive_exams_list')
        .select('simple_id')
        .eq('name', formData.exam.name)
        .maybeSingle();
      examId = examData?.simple_id;
    }
    
    // Store RRB JE subject name for later use in lobby creation
    if (formData.subject && formData.subject.id.includes('rrb_je_')) {
      sessionStorage.setItem(`rrb_je_subject_${formData.subject.id}`, formData.subject.name);
    }
    
    onSubjectSelect({
      sourceType: 'exam',
      examId,
      branchId: formData.branch.id,
      subjectId: formData.subject.id,
      topicId: formData.topic?.id,
      maxPlayers: formData.lobbyType === 'practice' ? 1 : (formData.players || 2),
      lobbyType: formData.lobbyType
    });
    resetModal();
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({
      lobbyType: null,
      exam: null,
      branch: null,
      subject: null,
      topic: null,
      players: null,
    });
    setBranches([]);
    setSubjects([]);
    setTopics([]);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      let targetStep = currentStep - 1;
      
      // Handle backing from step 6 - determine correct previous step
      if (currentStep === 6) {
        // For quiz mode, skip step 5 (topics) and go back to step 4 (subjects)
        if (formData.lobbyType === 'quiz') {
          targetStep = 4;
        } else {
          // For practice mode, go to step 5 (topics)
          targetStep = 5;
        }
      } 
      // Handle backing from step 4 (subjects) - check if we need to skip step 3
      else if (currentStep === 4) {
        // Check if we skipped step 3 (branch selection)
        const hasTechnicalBranches = formData.exam ? EXAMS_WITH_TECHNICAL_BRANCHES.includes(formData.exam.name) : false;
        targetStep = hasTechnicalBranches ? 3 : 2;
      }
      // All other steps just go back one step
      
      setCurrentStep(targetStep);
    }
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    const hasTechnicalBranches = formData.exam ? EXAMS_WITH_TECHNICAL_BRANCHES.includes(formData.exam.name) : false;
    const totalSteps = formData.lobbyType === 'practice' ? (hasTechnicalBranches ? 6 : 5) : (hasTechnicalBranches ? 5 : 4);
    return `Create ${formData.lobbyType?.charAt(0).toUpperCase() + formData.lobbyType?.slice(1) || ''} Lobby - Step ${currentStep} of ${totalSteps}`;
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
          {currentStep === 5 && formData.lobbyType === 'practice' && (
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
              {formData.lobbyType === 'quiz' ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Step 5: Choose Lobby Size
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        formData.players === 2 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => handlePlayersSelect(2)}
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
                        formData.players === 4 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/30'
                      }`}
                      onClick={() => handlePlayersSelect(4)}
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
                
                {((formData.lobbyType === 'quiz' && formData.players) || (formData.lobbyType === 'practice' && formData.topic)) && (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Creating lobby for:</p>
                      <p className="font-semibold text-sm">
                        {formData.subject?.name}
                        {formData.topic && ` → ${formData.topic.name}`}
                        {' • '}
                        {formData.lobbyType === 'quiz' ? '🏆 Quiz' : '🎯 Practice'}
                        {' • '}
                        {formData.lobbyType === 'quiz' ? `${formData.players} Players` : 'Single Player'}
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