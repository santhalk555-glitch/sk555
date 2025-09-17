import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, User, BookOpen, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  display_user_id: string;
  username: string;
  course_name: string;
  competitive_exams: string[];
  subjects: string[];
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
          .from('profiles')
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
      } else {
        setProfile(data);
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
                  <Badge key={exam} variant="outline">
                    {exam}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;