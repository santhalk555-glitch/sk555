import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const COURSE_OPTIONS = [
  // Engineering and Technology - Core Branches
  "Engineering and Technology → Mechanical Engineering",
  "Engineering and Technology → Electrical Engineering",
  "Engineering and Technology → Civil Engineering",
  "Engineering and Technology → Computer Science Engineering",
  "Engineering and Technology → Electronics and Communication Engineering",
  "Engineering and Technology → Information Technology",
  "Engineering and Technology → Chemical Engineering",
  "Engineering and Technology → Aerospace Engineering",
  "Engineering and Technology → Biomedical Engineering",
  "Engineering and Technology → Mechatronics Engineering",
  "Engineering and Technology → Industrial Engineering",
  
  // Engineering and Technology - Emerging/Modern Branches
  "Engineering and Technology → Artificial Intelligence and Machine Learning (AI & ML)",
  "Engineering and Technology → Data Science",
  "Engineering and Technology → Cybersecurity",
  "Engineering and Technology → Robotics Engineering",
  "Engineering and Technology → Internet of Things (IoT)",
  "Engineering and Technology → Blockchain Technology",
  "Engineering and Technology → Cloud Computing",
  "Engineering and Technology → Software Engineering",
  "Engineering and Technology → Renewable Energy Engineering",
  "Engineering and Technology → 3D Printing and Additive Manufacturing",
  
  // Medical and Health Sciences
  "Medical and Health Sciences → MBBS (Medicine)",
  "Medical and Health Sciences → BDS (Dental Surgery)",
  "Medical and Health Sciences → BSc Nursing",
  "Medical and Health Sciences → Pharmacy (BPharm / MPharm)",
  "Medical and Health Sciences → Physiotherapy",
  "Medical and Health Sciences → Medical Laboratory Technology",
  "Medical and Health Sciences → Public Health",
  "Medical and Health Sciences → Biotechnology",
  "Medical and Health Sciences → Biomedical Science",
  "Medical and Health Sciences → Genetic Engineering",
  "Medical and Health Sciences → Healthcare Informatics",
  
  // Commerce and Management
  "Commerce and Management → BCom / MCom",
  "Commerce and Management → BBA / MBA",
  "Commerce and Management → Finance",
  "Commerce and Management → Marketing",
  "Commerce and Management → Human Resource Management",
  "Commerce and Management → International Business",
  "Commerce and Management → Accounting",
  "Commerce and Management → Business Analytics",
  "Commerce and Management → Entrepreneurship",
  "Commerce and Management → Financial Technology (FinTech)",
  "Commerce and Management → Digital Marketing",
  "Commerce and Management → Supply Chain Management",
  
  // Science
  "Science → Physics",
  "Science → Chemistry",
  "Science → Mathematics",
  "Science → Biology",
  "Science → Statistics",
  "Science → Environmental Science",
  "Science → Computer Science",
  "Science → Data Science",
  "Science → Microbiology",
  "Science → Biochemistry",
  "Science → Artificial Intelligence",
  "Science → Machine Learning",
  "Science → Neuroscience",
  "Science → Quantum Computing",
  
  // Arts and Humanities
  "Arts and Humanities → History",
  "Arts and Humanities → Political Science",
  "Arts and Humanities → Sociology",
  "Arts and Humanities → Psychology",
  "Arts and Humanities → Philosophy",
  "Arts and Humanities → Literature (English, Hindi, etc)",
  "Arts and Humanities → Economics",
  "Arts and Humanities → Geography",
  "Arts and Humanities → Anthropology",
  "Arts and Humanities → Digital Humanities",
  
  // Law and Legal Studies
  "Law and Legal Studies → BA LLB",
  "Law and Legal Studies → BBA LLB",
  "Law and Legal Studies → LLB",
  "Law and Legal Studies → LLM",
  "Law and Legal Studies → Corporate Law",
  "Law and Legal Studies → Criminal Law",
  "Law and Legal Studies → International Law",
  "Law and Legal Studies → Constitutional Law",
  "Law and Legal Studies → Cyber Law",
  "Law and Legal Studies → Intellectual Property Law",
  
  // Agriculture and Allied Sciences
  "Agriculture and Allied Sciences → Agriculture",
  "Agriculture and Allied Sciences → Horticulture",
  "Agriculture and Allied Sciences → Forestry",
  "Agriculture and Allied Sciences → Fisheries Science",
  "Agriculture and Allied Sciences → Veterinary Science",
  "Agriculture and Allied Sciences → Dairy Technology",
  "Agriculture and Allied Sciences → Food Technology",
  "Agriculture and Allied Sciences → AgriTech",
  "Agriculture and Allied Sciences → Sustainable Agriculture",
  
  // Education and Teaching
  "Education and Teaching → BEd",
  "Education and Teaching → MEd",
  "Education and Teaching → Educational Psychology",
  "Education and Teaching → Curriculum Development",
  "Education and Teaching → Teacher Training",
  "Education and Teaching → Educational Technology (EdTech)",
  
  // Design, Architecture and Fine Arts
  "Design, Architecture and Fine Arts → Architecture (BArch / MArch)",
  "Design, Architecture and Fine Arts → Interior Design",
  "Design, Architecture and Fine Arts → Fashion Design",
  "Design, Architecture and Fine Arts → Graphic Design",
  "Design, Architecture and Fine Arts → Industrial Design",
  "Design, Architecture and Fine Arts → Fine Arts",
  "Design, Architecture and Fine Arts → Animation",
  "Design, Architecture and Fine Arts → Multimedia",
  "Design, Architecture and Fine Arts → Game Design",
  "Design, Architecture and Fine Arts → User Experience Design (UX Design)"
];

const COMPETITIVE_EXAM_OPTIONS = [
  "RRB JE",
  "RRB ALP",
  "SSC JE", 
  "SSC CGL",
  "GATE",
  "UPSC Civil Services",
  "State PSC Exams",
  "ISRO Scientist/Engineer",
  "DRDO Scientist/Engineer",
  "BARC OCES",
  "Railway GDCE",
  "Bank PO",
  "Bank Clerk",
  "Other"
];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics", 
  "Chemistry",
  "Biology",
  "Computer Science",
  "Mechanical Engineering",
  "Electrical Engineering", 
  "Civil Engineering",
  "Electronics and Communication",
  "Information Technology",
  "Chemical Engineering",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Software Engineering",
  "Web Development",
  "Mobile App Development",
  "Database Management",
  "Networking",
  "Cloud Computing",
  "DevOps",
  "Statistics",
  "Economics",
  "Business Studies",
  "Accounting",
  "Finance",
  "Marketing",
  "Management",
  "History",
  "Geography", 
  "Political Science",
  "Psychology",
  "Sociology",
  "Philosophy",
  "English Literature",
  "Hindi Literature",
  "Biotechnology",
  "Microbiology",
  "Biochemistry",
  "Environmental Science",
  "Agriculture",
  "Law",
  "Medicine",
  "Pharmacy",
  "Nursing",
  "Architecture",
  "Design",
  "Fine Arts",
  "General Knowledge",
  "Current Affairs",
  "Reasoning",
  "Aptitude",
  "Quantitative Ability",
  "Verbal Ability",
  "English Grammar",
  "General Science"
];

export const ProfileCreationForm = () => {
  const [username, setUsername] = useState('');
  const [courseName, setCourseName] = useState('');
  const [competitiveExams, setCompetitiveExams] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCompetitiveExamChange = (exam: string, checked: boolean) => {
    if (checked) {
      setCompetitiveExams([...competitiveExams, exam]);
    } else {
      setCompetitiveExams(competitiveExams.filter(e => e !== exam));
    }
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    if (checked) {
      setSubjects([...subjects, subject]);
    } else {
      setSubjects(subjects.filter(s => s !== subject));
    }
  };

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('Username is required');
      return false;
    }
    if (value.length < 4 || value.length > 20) {
      setUsernameError('Username must be 4-20 characters long');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!validateUsername(username)) return false;
    
    try {
      const { data, error } = await supabase
        .from('profile_view')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setUsernameError('Username is already taken');
        return false;
      }
      
      setUsernameError('');
      return true;
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a profile.',
        variant: 'destructive'
      });
      return;
    }

    if (!username || !courseName || competitiveExams.length === 0 || subjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    const isUsernameValid = await checkUsernameAvailability(username);
    if (!isUsernameValid) return;

    setLoading(true);

    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profile_view')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            username: username.toLowerCase(),
            course_name: courseName,
            competitive_exams: competitiveExams,
            subjects: subjects
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Generate 8-digit user ID
        const { data: generatedId, error: idError } = await supabase
          .rpc('generate_8_digit_user_id');

        if (idError) throw idError;

        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            username: username.toLowerCase(),
            course_name: courseName,
            competitive_exams: competitiveExams,
            subjects: subjects,
            display_user_id: generatedId
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Profile created successfully!'
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Create Your Study Profile</CardTitle>
            <CardDescription className="text-center">
              Help us find the perfect study partners for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Selection */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    validateUsername(e.target.value);
                  }}
                  onBlur={() => username && checkUsernameAvailability(username)}
                  placeholder="Enter username (4-20 characters)"
                  className={usernameError ? "border-destructive" : ""}
                />
                {usernameError && (
                  <p className="text-sm text-destructive">{usernameError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Only letters, numbers, and underscores allowed
                </p>
              </div>

              {/* Course Name */}
              <div className="space-y-2">
                <Label htmlFor="course-name">Course Name *</Label>
                <Select value={courseName} onValueChange={setCourseName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your course" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_OPTIONS.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Competitive Exams */}
              <div className="space-y-3">
                <Label>Competitive Exams *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                  {COMPETITIVE_EXAM_OPTIONS.map((exam) => (
                    <div key={exam} className="flex items-center space-x-2">
                      <Checkbox
                        id={`exam-${exam}`}
                        checked={competitiveExams.includes(exam)}
                        onCheckedChange={(checked) => 
                          handleCompetitiveExamChange(exam, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`exam-${exam}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {exam}
                      </Label>
                    </div>
                  ))}
                </div>
                {competitiveExams.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {competitiveExams.join(', ')}
                  </p>
                )}
              </div>

              {/* Subjects */}
              <div className="space-y-3">
                <Label>Subjects *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                  {SUBJECT_OPTIONS.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject}`}
                        checked={subjects.includes(subject)}
                        onCheckedChange={(checked) => 
                          handleSubjectChange(subject, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`subject-${subject}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
                {subjects.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {subjects.join(', ')}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile & Find Matches'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};