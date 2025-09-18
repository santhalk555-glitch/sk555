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

const COURSE_CATEGORIES = {
  "🧪 Engineering and Technology": {
    "Core Branches": [
      "Mechanical Engineering",
      "Electrical Engineering", 
      "Civil Engineering",
      "Computer Science Engineering",
      "Electronics and Communication Engineering",
      "Information Technology",
      "Chemical Engineering",
      "Aerospace Engineering",
      "Biomedical Engineering",
      "Mechatronics Engineering",
      "Industrial Engineering"
    ],
    "Emerging / Modern Branches": [
      "Artificial Intelligence and Machine Learning (AI & ML)",
      "Data Science",
      "Cybersecurity", 
      "Robotics Engineering",
      "Internet of Things (IoT)",
      "Blockchain Technology",
      "Cloud Computing",
      "Software Engineering",
      "Renewable Energy Engineering",
      "3D Printing and Additive Manufacturing"
    ]
  },
  "🏥 Medical and Health Sciences": [
    "MBBS (Medicine)",
    "BDS (Dental Surgery)",
    "BSc Nursing",
    "Pharmacy (BPharm / MPharm)",
    "Physiotherapy",
    "Medical Laboratory Technology",
    "Public Health",
    "Biotechnology",
    "Biomedical Science", 
    "Genetic Engineering",
    "Healthcare Informatics"
  ],
  "💼 Commerce and Management": [
    "BCom / MCom",
    "BBA / MBA",
    "Finance",
    "Marketing",
    "Human Resource Management",
    "International Business",
    "Accounting",
    "Business Analytics",
    "Entrepreneurship",
    "Financial Technology (FinTech)",
    "Digital Marketing",
    "Supply Chain Management"
  ],
  "🎓 Science": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Statistics",
    "Environmental Science",
    "Computer Science",
    "Data Science",
    "Microbiology",
    "Biochemistry",
    "Artificial Intelligence",
    "Machine Learning",
    "Neuroscience",
    "Quantum Computing"
  ],
  "🎨 Arts and Humanities": [
    "History",
    "Political Science",
    "Sociology",
    "Psychology",
    "Philosophy",
    "Literature (English, Hindi, etc)",
    "Economics",
    "Geography",
    "Anthropology",
    "Digital Humanities"
  ],
  "⚖️ Law and Legal Studies": [
    "BA LLB",
    "BBA LLB",
    "LLB",
    "LLM",
    "Corporate Law",
    "Criminal Law",
    "International Law",
    "Constitutional Law",
    "Cyber Law",
    "Intellectual Property Law"
  ],
  "🌾 Agriculture and Allied Sciences": [
    "Agriculture",
    "Horticulture",
    "Forestry",
    "Fisheries Science",
    "Veterinary Science",
    "Dairy Technology",
    "Food Technology",
    "AgriTech",
    "Sustainable Agriculture"
  ],
  "🏛️ Education and Teaching": [
    "BEd",
    "MEd",
    "Educational Psychology",
    "Curriculum Development",
    "Teacher Training",
    "Educational Technology (EdTech)"
  ],
  "🖌️ Design, Architecture and Fine Arts": [
    "Architecture (BArch / MArch)",
    "Interior Design",
    "Fashion Design",
    "Graphic Design",
    "Industrial Design",
    "Fine Arts",
    "Animation",
    "Multimedia",
    "Game Design",
    "User Experience Design (UX Design)"
  ]
};

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
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
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

  const handleMainCategoryChange = (category: string) => {
    setMainCategory(category);
    setSubCategory('');
    setCourseName('');
  };

  const handleSubCategoryChange = (subCat: string) => {
    setSubCategory(subCat);
    setCourseName(`${mainCategory} → ${subCat}`);
  };

  const getSubCategories = () => {
    if (!mainCategory) return [];
    
    const categoryData = COURSE_CATEGORIES[mainCategory as keyof typeof COURSE_CATEGORIES];
    
    if (Array.isArray(categoryData)) {
      return categoryData;
    }
    
    // Handle Engineering and Technology with subcategories
    if (typeof categoryData === 'object') {
      return Object.entries(categoryData).flatMap(([groupName, items]) => 
        items.map(item => `${groupName}: ${item}`)
      );
    }
    
    return [];
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

              {/* Course Selection - Cascading Dropdowns */}
              <div className="space-y-4">
                <Label>Course Selection *</Label>
                
                {/* Main Category Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="main-category">Main Category</Label>
                  <Select value={mainCategory} onValueChange={handleMainCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(COURSE_CATEGORIES).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Dropdown */}
                {mainCategory && (
                  <div className="space-y-2">
                    <Label htmlFor="sub-category">Subcategory</Label>
                    <Select value={subCategory} onValueChange={handleSubCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSubCategories().map((subCat) => (
                          <SelectItem key={subCat} value={subCat}>
                            {subCat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Display selected course */}
                {courseName && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Selected Course:</p>
                    <p className="font-medium">{courseName}</p>
                  </div>
                )}
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