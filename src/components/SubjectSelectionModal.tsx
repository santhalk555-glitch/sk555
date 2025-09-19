import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, BookOpen, Users, Crown, GraduationCap, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { getAllCourseOptions, COMPETITIVE_EXAM_OPTIONS, RRB_JE_ENGINEERING_BRANCHES } from '@/constants/profileOptions';

interface SubjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectSelect: (selectionData: {
    sourceType: 'course' | 'exam';
    courseId?: string;
    examId?: string;
    subjectId: string;
    topicId: string;
    maxPlayers: 2 | 4;
    gameMode: 'study' | 'quiz';
  }) => void;
}

interface CourseOption {
  name: string;
}

interface ExamOption {
  name: string;
}

interface Subject {
  id: string;
  name: string;
  source_type: 'course' | 'exam';
  course_id?: string;
  exam_id?: string;
}

interface Topic {
  id: string;
  name: string;
  subject_id: string;
}

const SubjectSelectionModal = ({ isOpen, onClose, onSubjectSelect }: SubjectSelectionModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSourceType, setSelectedSourceType] = useState<'course' | 'exam' | null>(null);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [examOptions, setExamOptions] = useState<ExamOption[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamOption | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<2 | 4 | null>(null);
  const [selectedGameMode, setSelectedGameMode] = useState<'study' | 'quiz' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const loadOptions = () => {
    // Load course options from the same source as ProfileCreationForm
    const courses = getAllCourseOptions().map(name => ({ name }));
    setCourseOptions(courses);
    
    // Load exam options from the same source as ProfileCreationForm
    const exams = COMPETITIVE_EXAM_OPTIONS.map(name => ({ name }));
    setExamOptions(exams);
  };

  const fetchSubjects = async (sourceType: 'course' | 'exam', selectedName: string) => {
    try {
      setLoading(true);
      
      // Special handling for RRB JE - show engineering branches as subjects
      if (sourceType === 'exam' && selectedName === 'RRB JE') {
        const rrb_je_subjects = Object.keys(RRB_JE_ENGINEERING_BRANCHES).map((branch, index) => ({
          id: `rrb_je_${index}`,
          name: branch,
          source_type: 'exam' as const,
          exam_id: 'rrb_je'
        }));
        setSubjects(rrb_je_subjects);
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
        // If no matching record found, show empty subjects
        setSubjects([]);
        return;
      }

      const query = supabase
        .from('subjects_hierarchy')
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
      const typedSubjects = (data || []).map(subject => ({
        ...subject,
        source_type: subject.source_type as 'course' | 'exam'
      }));
      
      setSubjects(typedSubjects);
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
      
      // Special handling for RRB JE engineering branches - show detailed subjects as topics
      if (subjectId.startsWith('rrb_je_') && selectedExam?.name === 'RRB JE') {
        const branchIndex = parseInt(subjectId.replace('rrb_je_', ''));
        const branchName = Object.keys(RRB_JE_ENGINEERING_BRANCHES)[branchIndex];
        const branchSubjects = RRB_JE_ENGINEERING_BRANCHES[branchName as keyof typeof RRB_JE_ENGINEERING_BRANCHES];
        
        const rrb_je_topics = branchSubjects.map((subject, index) => ({
          id: `${subjectId}_topic_${index}`,
          name: subject,
          subject_id: subjectId
        }));
        
        setTopics(rrb_je_topics);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('topics')
        .select('id, name, simple_id, subject_id')
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

  const handleSourceTypeSelect = (type: 'course' | 'exam') => {
    setSelectedSourceType(type);
    setCurrentStep(2);
  };

  const handleCourseSelect = (course: CourseOption) => {
    setSelectedCourse(course);
    fetchSubjects('course', course.name);
    setCurrentStep(3);
  };

  const handleExamSelect = (exam: ExamOption) => {
    setSelectedExam(exam);
    fetchSubjects('exam', exam.name);
    setCurrentStep(3);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    fetchTopics(subject.id);
    setCurrentStep(4);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setCurrentStep(5);
  };

  const handleGameModeSelect = (mode: 'study' | 'quiz') => {
    setSelectedGameMode(mode);
    setCurrentStep(6);
  };

  const handleCreate = async () => {
    if (selectedSourceType && selectedSubject && selectedTopic && selectedPlayers && selectedGameMode) {
      // Get the actual database IDs for course/exam
      let courseId: string | undefined;
      let examId: string | undefined;
      
      if (selectedSourceType === 'course' && selectedCourse) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('simple_id')
          .eq('name', selectedCourse.name)
          .maybeSingle();
        courseId = courseData?.simple_id;
      } else if (selectedSourceType === 'exam' && selectedExam) {
        const { data: examData } = await supabase
          .from('competitive_exams_list')
          .select('simple_id')
          .eq('name', selectedExam.name)
          .maybeSingle();
        examId = examData?.simple_id;
      }
      
      // Store RRB JE topic name for later use in lobby creation
      if (selectedTopic && selectedTopic.id.includes('rrb_je_')) {
        sessionStorage.setItem(`rrb_je_topic_${selectedTopic.id}`, selectedTopic.name);
      }
      
      onSubjectSelect({
        sourceType: selectedSourceType,
        courseId,
        examId,
        subjectId: selectedSubject.id,
        topicId: selectedTopic.id,
        maxPlayers: selectedPlayers,
        gameMode: selectedGameMode
      });
      resetModal();
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedSourceType(null);
    setSelectedCourse(null);
    setSelectedExam(null);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedPlayers(null);
    setSelectedGameMode(null);
    setSubjects([]);
    setTopics([]);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      
      // Reset subsequent selections
      if (currentStep === 2) {
        setSelectedSourceType(null);
      } else if (currentStep === 3) {
        setSelectedCourse(null);
        setSelectedExam(null);
        setSubjects([]);
      } else if (currentStep === 4) {
        setSelectedSubject(null);
        setTopics([]);
      } else if (currentStep === 5) {
        setSelectedTopic(null);
      } else if (currentStep === 6) {
        setSelectedGameMode(null);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Create Study Lobby - Step {currentStep} of 6
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
          {/* Step 1: Source Type Selection */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Step 1: Choose Source Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary/30"
                  onClick={() => handleSourceTypeSelect('course')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">📚 Course</h4>
                    <p className="text-sm text-muted-foreground">
                      Study topics from your academic course
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary/30"
                  onClick={() => handleSourceTypeSelect('exam')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center mx-auto mb-3">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">🏆 Competitive Exam</h4>
                    <p className="text-sm text-muted-foreground">
                      Prepare for competitive examinations
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Course/Exam Selection */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                {selectedSourceType === 'course' ? <GraduationCap className="w-5 h-5 mr-2 text-primary" /> : <Trophy className="w-5 h-5 mr-2 text-primary" />}
                Step 2: Choose {selectedSourceType === 'course' ? 'Course' : 'Competitive Exam'}
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                {selectedSourceType === 'course' ? (
                  courseOptions.map((course, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="p-3 text-left cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:border-primary/30 whitespace-normal"
                      onClick={() => handleCourseSelect(course)}
                    >
                      {course.name}
                    </Badge>
                  ))
                ) : (
                  examOptions.map((exam, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="p-3 text-center cursor-pointer transition-all duration-200 hover:scale-105 hover:bg-primary/10 hover:border-primary/30"
                      onClick={() => handleExamSelect(exam)}
                    >
                      {exam.name}
                    </Badge>
                  ))
                )}
              </div>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Back
              </Button>
            </div>
          )}

          {/* Step 3: Subject Selection */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Step 3: Choose Subject
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

          {/* Step 4: Topic Selection */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Step 4: Choose Topic
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

          {/* Step 5: Game Mode Selection */}
          {currentStep === 5 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Crown className="w-5 h-5 mr-2 text-primary" />
                Step 5: Choose Game Mode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary/30"
                  onClick={() => handleGameModeSelect('study')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">📚 Study Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Collaborative study sessions and group learning
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:border-primary/30"
                  onClick={() => handleGameModeSelect('quiz')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold mb-2">🏆 Quiz Mode</h4>
                    <p className="text-sm text-muted-foreground">
                      Competitive quiz battles with real-time scoring
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Button variant="outline" onClick={handleBack} className="mt-4">
                Back
              </Button>
            </div>
          )}

          {/* Step 6: Player Count Selection */}
          {currentStep === 6 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Step 6: Choose Lobby Size
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
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                
                {selectedPlayers && (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Creating lobby for:</p>
                      <p className="font-semibold text-sm">
                        {selectedTopic?.name} • {selectedGameMode === 'quiz' ? '🏆 Quiz' : '📚 Study'} • {selectedPlayers} Players
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