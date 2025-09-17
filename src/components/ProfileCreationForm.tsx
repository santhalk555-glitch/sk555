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
  "BE Mechanical Engineering",
  "BE Electrical Engineering", 
  "BE Civil Engineering",
  "BE Computer Engineering",
  "BE Electronics & Telecommunication",
  "BSc Computer Science",
  "BSc Physics",
  "BSc Mathematics",
  "BCom",
  "BA English",
  "BA Economics",
  "Diploma in Mechanical Engineering",
  "Diploma in Electrical Engineering",
  "Diploma in Civil Engineering",
  "Other"
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
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Science",
  "Electronics",
  "General Science",
  "General Studies",
  "Reasoning",
  "Aptitude",
  "Current Affairs",
  "English",
  "Other"
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