import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { ArrowLeft, LogOut, User, BookOpen, Target, Trash2, Mail, Instagram } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CompetitiveExam, parseCompetitiveExams } from '@/types/profile';

interface UserProfile {
  display_user_id: string;
  username: string;
  course_name: string;
  competitive_exams: CompetitiveExam[];
  subjects: string[];
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profile_view')
          .select('display_user_id, username, course_name, competitive_exams, subjects')
          .eq('user_id', user.id)
          .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive'
        });
      } else if (data) {
        // Parse competitive_exams from JSONB to CompetitiveExam[]
        const profileData: UserProfile = {
          ...data,
          competitive_exams: parseCompetitiveExams(data.competitive_exams),
          subjects: data.subjects || []
        };
        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, navigate, toast]);

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.'
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Delete user profile and related data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Delete the user account from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        throw authError;
      }

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.'
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-16 bg-muted rounded"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                It seems you haven't created your profile yet.
              </p>
              <Button onClick={() => navigate('/create-profile')}>
                Create Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="shadow-lg"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              My Profile
            </CardTitle>
            <CardDescription>
              Your study profile and matching preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* User ID Display */}
            <div className="text-center p-6 bg-gradient-card rounded-lg border border-primary/20">
              <div className="text-sm text-muted-foreground mb-2">Username</div>
              <div className="text-4xl font-bold text-primary">
                @{profile.username}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Your unique username for connecting with friends
              </div>
            </div>

            {/* Course Information */}
            <div className="space-y-3">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Course</h3>
              </div>
              <div className="pl-7">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {profile.course_name}
                </Badge>
              </div>
            </div>

            {/* Competitive Exams */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Competitive Exams</h3>
              </div>
              <div className="pl-7 flex flex-wrap gap-2">
                {profile.competitive_exams.map((exam) => (
                  <Badge key={exam.simple_id} variant="outline">
                    {exam.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold">Subjects</h3>
              </div>
              <div className="pl-7 flex flex-wrap gap-2">
                {profile.subjects.map((subject) => (
                  <Badge key={subject} variant="outline">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => navigate('/create-profile')} 
                className="w-full"
                variant="outline"
              >
                Edit Profile
              </Button>
              <Button 
                onClick={() => navigate('/profile-matches')} 
                className="w-full"
              >
                Find Study Partners
              </Button>
              
              {/* Delete Account */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Connect With Us Section */}
            <div className="pt-8 mt-8 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 text-center">Connect With Us</h3>
              <div className="space-y-3">
                <a 
                  href="mailto:studymatesmeet@gmail.com"
                  className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:scale-105 group"
                >
                  <Mail className="w-5 h-5 text-primary group-hover:animate-pulse" />
                  <div className="text-center">
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">studymatesmeet@gmail.com</div>
                  </div>
                </a>
                
                <a 
                  href="https://instagram.com/studymatesmeet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 p-4 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-200 hover:scale-105 group"
                >
                  <Instagram className="w-5 h-5 text-pink-500 group-hover:animate-pulse" />
                  <div className="text-center">
                    <div className="font-medium">Instagram</div>
                    <div className="text-sm text-muted-foreground">@studymatesmeet</div>
                  </div>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;