import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { COMPETITIVE_EXAM_OPTIONS, RRB_JE_ENGINEERING_BRANCHES } from '@/constants/profileOptions';
import { ArrowLeft } from 'lucide-react';

// Comprehensive subject list for all exams
const ALL_SUBJECTS = [
  'Quantitative Aptitude',
  'Reasoning Ability',
  'Physics',
  'Chemistry',
  'Biology',
  'Material Science',
  'Strength of Materials',
  'Machining',
  'Welding',
  'Grinding & Finishing Process',
  'Metrology',
  'Fluid Mechanics & Hydraulic Machinery',
  'Industrial Management',
  'Thermal Engineering',
  'Engineering Mechanics',
  'Theory of Machines',
  'Machine Design',
  'Heat Transfer',
  'Refrigeration and Air Conditioning',
  'Production Engineering',
  'Power Plant Engineering',
  'Building Construction',
  'Building Materials',
  'Construction of Substructure',
  'Construction of Superstructure',
  'Building Finishes',
  'Building Maintenance',
  'Building Drawing',
  'Concrete Technology',
  'Surveying',
  'Computer Aided Design',
  'Geo Technical Engineering',
  'Hydraulics & Irrigation Engineering',
  'Mechanics & Theory of Structures',
  'Design of Concrete Structures',
  'Design of Steel Structures',
  'Transportation & Highway Engineering',
  'Environmental Engineering',
  'Advanced Construction Techniques & Equipment',
  'Estimating, Costing, Contracts & Accounts',
  'Structural Analysis',
  'Basic Concepts',
  'Circuit Laws & Magnetic Circuits',
  'AC Fundamentals',
  'Measurement & Measuring Instruments',
  'Electrical Machines',
  'Power Systems',
  'Power Electronics',
  'Generation, Transmission and Distribution',
  'Switchgear and Protection',
  'Utilization of Electrical Energy',
  'Control Systems',
  'Analog Electronics',
  'Digital Electronics',
  'Signals and Systems',
  'Electromagnetic Theory',
  'Communication Systems',
  'Microprocessors and Microcontrollers',
  'VLSI Design',
  'Embedded Systems',
  'Optical Communication',
  'Wireless Communication',
  'Data Structures',
  'Algorithms',
  'Computer Networks',
  'Operating Systems',
  'Database Management Systems',
  'Software Engineering',
  'Compiler Design',
  'Theory of Computation',
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing'
];

// Exams that have technical + general streams (require branch selection)
const EXAMS_WITH_TECHNICAL_BRANCHES = ['RRB JE'];

export interface SelectionData {
  examId: string;
  branchId?: string;
  subjectId: string;
  topicId?: string;
  maxPlayers: number;
  lobbyType: 'quiz' | 'practice';
}

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectSelect: (selectionData: SelectionData) => void;
}

interface ExamOption {
  name: string;
  simple_id?: string;
}

interface Branch {
  id: string;
  name: string;
  exam_id?: string;
  exam_simple_id?: string;
}

interface Subject {
  id: string;
  name: string;
  simple_id?: string;
  branch_id?: string;
}

interface Topic {
  id: string;
  name: string;
  simple_id?: string;
  subject_id?: string;
}

const SubjectSelectionModal = ({ isOpen, onClose, onSubjectSelect }: SubjectSelectionModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLobbyType, setSelectedLobbyType] = useState<'quiz' | 'practice' | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamOption | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(2);
  const [examOptions, setExamOptions] = useState<ExamOption[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      resetModal();
      loadOptions();
    }
  }, [isOpen]);

  const loadOptions = () => {
    // Load exam options
    const exams = COMPETITIVE_EXAM_OPTIONS.map(name => ({ 
      name,
      simple_id: name.toLowerCase().replace(/\s+/g, '_')
    }));
    setExamOptions(exams);
  };

  const fetchBranches = async (examName: string) => {
    try {
      setLoading(true);
      
      // Check if this exam has technical + general streams
      const hasTechnicalBranches = EXAMS_WITH_TECHNICAL_BRANCHES.includes(examName);
      
      if (hasTechnicalBranches) {
        // Special handling for RRB JE - create synthetic branches
        if (examName === 'RRB JE') {
          const rrb_je_branches = [
            ...Object.keys(RRB_JE_ENGINEERING_BRANCHES).map((branch, index) => ({
              id: `rrb_je_${index}`,
              name: branch,
              exam_id: 'rrb_je'
            })),
            {
              id: 'rrb_je_general',
              name: 'General',
              exam_id: 'rrb_je'
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
          .eq('name', examName)
          .maybeSingle();
        
        if (examData?.simple_id) {
          const { data, error } = await supabase
            .from('branches')
            .select('*')
            .eq('exam_simple_id', examData.simple_id)
            .order('name');
          
          if (error) throw error;
          setBranches(data || []);
        } else {
          setBranches([]);
        }
      } else {
        // For exams with only general subjects, skip to subject selection
        setBranches([]);
        // Directly show all subjects
        const allSubjects = ALL_SUBJECTS.map((subject, index) => ({
          id: `subject_${index}`,
          name: subject,
          branch_id: 'general'
        }));
        setSubjects(allSubjects);
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

  const fetchSubjects = async (branchId: string) => {
    try {
      setLoading(true);
      
      // Show all subjects for any branch/exam
      const allSubjects = ALL_SUBJECTS.map((subject, index) => ({
        id: `subject_${index}`,
        name: subject,
        branch_id: branchId
      }));
      
      setSubjects(allSubjects);
      setLoading(false);
      return;
      
      // For other branches, fetch from subjects_hierarchy
      const { data, error } = await supabase
        .from('subjects_hierarchy')
        .select('id, name, simple_id')
        .order('name');
      
      if (error) throw error;
      
      // Map to match expected structure
      const mappedSubjects = (data || []).map(subject => ({
        id: subject.id,
        name: subject.name,
        simple_id: subject.simple_id,
        branch_id: branchId
      }));
      
      setSubjects(mappedSubjects);
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
    fetchBranches(exam.name);
    setCurrentStep(3);
  };

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    fetchSubjects(branch.id);
    setCurrentStep(4);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    
    // Store subject name for RRB JE subjects (synthetic IDs)
    if (subject.id.startsWith('rrb_je_') || subject.id.startsWith('general_')) {
      sessionStorage.setItem(`rrb_je_subject_${subject.id}`, subject.name);
    }
    
    if (selectedLobbyType === 'practice') {
      fetchTopics(subject.id);
      setCurrentStep(5);
    } else {
      setCurrentStep(6); // Go to player count selection for quiz
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentStep(6); // Go to player count selection
  };

  const handleCreate = () => {
    if (selectedExam && selectedSubject) {
      const selectionData: SelectionData = {
        examId: selectedExam.simple_id || selectedExam.name.toLowerCase().replace(/\s+/g, '_'),
        branchId: selectedBranch?.id,
        subjectId: selectedSubject.id,
        topicId: selectedTopic?.id,
        maxPlayers: selectedPlayerCount,
        lobbyType: selectedLobbyType!
      };
      
      onSubjectSelect(selectionData);
      resetModal();
      onClose();
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedLobbyType(null);
    setSelectedExam(null);
    setSelectedBranch(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedPlayerCount(2);
    setExamOptions([]);
    setBranches([]);
    setSubjects([]);
    setTopics([]);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 3) {
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
        }
      }
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select Lobby Type';
      case 2:
        return 'Select Exam';
      case 3:
        return 'Select Branch';
      case 4:
        return 'Select Subject';
      case 5:
        return 'Select Topic';
      case 6:
        return 'Select Players';
      default:
        return 'Create Lobby';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gaming-dark via-gaming-darker to-black border-gaming-primary/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="text-gaming-accent hover:text-white hover:bg-gaming-accent/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h2 className="text-2xl font-bold text-white">{getStepTitle()}</h2>
            </div>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gaming-accent hover:text-white hover:bg-gaming-accent/20"
            >
              ×
            </Button>
          </div>

          {/* Step 1: Lobby Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-gray-300 mb-6">Choose your lobby type:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="p-6 cursor-pointer hover:bg-gaming-primary/10 border-gaming-primary/30 bg-gaming-darker/50 transition-all duration-300"
                  onClick={() => handleLobbyTypeSelect('quiz')}
                >
                  <h3 className="text-xl font-bold text-white mb-2">Quiz Lobby</h3>
                  <p className="text-gray-300">Competitive quiz with scoring and leaderboards</p>
                </Card>
                <Card 
                  className="p-6 cursor-pointer hover:bg-gaming-secondary/10 border-gaming-secondary/30 bg-gaming-darker/50 transition-all duration-300"
                  onClick={() => handleLobbyTypeSelect('practice')}
                >
                  <h3 className="text-xl font-bold text-white mb-2">Practice Lobby</h3>
                  <p className="text-gray-300">Study mode with detailed explanations</p>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Exam Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">Select an exam:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {examOptions.map((exam) => (
                  <Card
                    key={exam.name}
                    className="p-4 cursor-pointer hover:bg-gaming-primary/10 border-gaming-primary/30 bg-gaming-darker/50 transition-all duration-300"
                    onClick={() => handleExamSelect(exam)}
                  >
                    <p className="text-white font-medium">{exam.name}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Branch Selection */}
          {currentStep === 3 && branches.length > 0 && (
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">Select a branch:</p>
              {loading ? (
                <div className="text-center text-gray-300">Loading branches...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {branches.map((branch) => (
                    <Card
                      key={branch.id}
                      className="p-4 cursor-pointer hover:bg-gaming-primary/10 border-gaming-primary/30 bg-gaming-darker/50 transition-all duration-300"
                      onClick={() => handleBranchSelect(branch)}
                    >
                      <p className="text-white font-medium">{branch.name}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Subject Selection */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">Select a subject:</p>
              {loading ? (
                <div className="text-center text-gray-300">Loading subjects...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {subjects.map((subject) => (
                    <Card
                      key={subject.id}
                      className="p-4 cursor-pointer hover:bg-gaming-primary/10 border-gaming-primary/30 bg-gaming-darker/50 transition-all duration-300"
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      <p className="text-white font-medium">{subject.name}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Topic Selection (for practice lobbies) */}
          {currentStep === 5 && selectedLobbyType === 'practice' && (
            <div className="space-y-4">
              <p className="text-gray-300 mb-4">Select a topic:</p>
              {loading ? (
                <div className="text-center text-gray-300">Loading topics...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {topics.map((topic) => (
                    <Card
                      key={topic.id}
                      className="p-4 cursor-pointer hover:bg-gaming-primary/10 border-gaming-primary/30 bg-gaming-darker/50 transition-all duration-300"
                      onClick={() => handleTopicSelect(topic)}
                    >
                      <p className="text-white font-medium">{topic.name}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Player Count Selection */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <p className="text-gray-300 mb-4">Select number of players:</p>
              <div className="flex justify-center space-x-4">
                {[2, 4].map((count) => (
                  <Badge
                    key={count}
                    variant={selectedPlayerCount === count ? "default" : "outline"}
                    className={`px-6 py-3 text-lg cursor-pointer transition-all duration-300 ${
                      selectedPlayerCount === count 
                        ? 'bg-gaming-primary text-white' 
                        : 'border-gaming-primary/30 text-gaming-primary hover:bg-gaming-primary/10'
                    }`}
                    onClick={() => setSelectedPlayerCount(count)}
                  >
                    {count} Players
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleCreate}
                  className="px-8 py-3 bg-gaming-primary hover:bg-gaming-primary/80 text-white font-medium"
                  disabled={!selectedExam || !selectedSubject}
                >
                  Create Lobby
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SubjectSelectionModal;