import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, BookOpen, Target, GraduationCap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  course_name: string;
  competitive_exams: string[];
  subjects: string[];
  created_at: string;
}

interface ProfileMatch extends Profile {
  matchScore: number;
  matchPercentage: number;
}

export const ProfileMatches = () => {
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<ProfileMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  const calculateMatchScore = (userProfile: Profile, otherProfile: Profile): number => {
    let score = 0;
    let maxScore = 0;

    // Course name match (high weight = 40 points)
    maxScore += 40;
    if (userProfile.course_name === otherProfile.course_name) {
      score += 40;
    }

    // Competitive exam overlap (medium weight = 30 points)
    maxScore += 30;
    const examOverlap = userProfile.competitive_exams.filter(exam => 
      otherProfile.competitive_exams.includes(exam)
    ).length;
    if (examOverlap > 0) {
      const examScore = Math.min(30, (examOverlap / Math.max(userProfile.competitive_exams.length, otherProfile.competitive_exams.length)) * 30);
      score += examScore;
    }

    // Subject overlap (medium weight = 30 points)
    maxScore += 30;
    const subjectOverlap = userProfile.subjects.filter(subject => 
      otherProfile.subjects.includes(subject)
    ).length;
    if (subjectOverlap > 0) {
      const subjectScore = Math.min(30, (subjectOverlap / Math.max(userProfile.subjects.length, otherProfile.subjects.length)) * 30);
      score += subjectScore;
    }

    return Math.round((score / maxScore) * 100);
  };

  const fetchCurrentUserProfile = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  };

  const fetchMatches = async (currentProfile: Profile, pageNum: number = 1) => {
    const from = (pageNum - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user?.id)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile matches.',
        variant: 'destructive'
      });
      return [];
    }

    const matchesWithScores: ProfileMatch[] = data.map(profile => ({
      ...profile,
      matchScore: calculateMatchScore(currentProfile, profile),
      matchPercentage: calculateMatchScore(currentProfile, profile)
    }));

    // Sort by match score (highest first)
    matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);

    return matchesWithScores;
  };

  const loadMatches = async (pageNum: number = 1) => {
    if (!currentUserProfile) return;

    setLoading(true);
    const newMatches = await fetchMatches(currentUserProfile, pageNum);
    
    if (pageNum === 1) {
      setMatches(newMatches);
    } else {
      setMatches(prev => [...prev, ...newMatches]);
    }

    setHasMore(newMatches.length === ITEMS_PER_PAGE);
    setLoading(false);
  };

  useEffect(() => {
    const initializeMatches = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      const userProfile = await fetchCurrentUserProfile();
      if (!userProfile) {
        toast({
          title: 'Profile Not Found',
          description: 'Please create your profile first.',
          variant: 'destructive'
        });
        navigate('/create-profile');
        return;
      }

      setCurrentUserProfile(userProfile);
      await loadMatches(1);
    };

    initializeMatches();
  }, [user, navigate]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMatches(nextPage);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading && matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding your study matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Your Study Matches</h1>
            <p className="text-muted-foreground">
              {matches.length} potential study partners found
            </p>
          </div>
        </div>

        {/* Current User Profile Summary */}
        {currentUserProfile && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{currentUserProfile.course_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentUserProfile.competitive_exams.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentUserProfile.subjects.join(', ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Matches List */}
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Study Partner</h3>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getMatchColor(match.matchPercentage)} border`}>
                    {match.matchPercentage}% Match
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{match.course_name}</span>
                    {match.course_name === currentUserProfile?.course_name && (
                      <Badge variant="secondary" className="text-xs">Same Course</Badge>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Competitive Exams:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.competitive_exams.map((exam) => (
                          <Badge 
                            key={exam} 
                            variant={currentUserProfile?.competitive_exams.includes(exam) ? "default" : "outline"}
                            className="text-xs"
                          >
                            {exam}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Subjects:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.subjects.map((subject) => (
                          <Badge 
                            key={subject} 
                            variant={currentUserProfile?.subjects.includes(subject) ? "default" : "outline"}
                            className="text-xs"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-end">
                  <Button size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button 
              variant="outline" 
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Matches'}
            </Button>
          </div>
        )}

        {matches.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches found yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a profile, or check back later as more students join!
              </p>
              <Button onClick={() => navigate('/create-profile')}>
                Update Your Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};