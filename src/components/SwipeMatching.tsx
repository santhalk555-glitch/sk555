import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  X, 
  Star, 
  MapPin, 
  BookOpen, 
  GraduationCap,
  Users,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, parseCompetitiveExams } from '@/types/profile';

interface SwipeMatchingProps {
  onBack: () => void;
  onMatchesUpdate?: (matches: any[]) => void;
}

const SwipeMatching = ({ onBack, onMatchesUpdate }: SwipeMatchingProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matches, setMatches] = useState<Profile[]>([]);
  // Removed instant popup functionality
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    if (!user) return;

    try {
      const { data: profilesData, error } = await supabase
        .from('profile_view')
        .select('*')
        .neq('user_id', user.id);

      if (error) throw error;

      setProfiles((profilesData || []).map(profile => ({
        ...profile,
        competitive_exams: parseCompetitiveExams(profile.competitive_exams)
      })));
    } catch (error) {
      console.error('Error loading profiles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profiles. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Friend request functions removed - handled in FriendRequests component

  const sendFriendRequest = async (targetProfile: Profile) => {
    if (!user) return;

    try {
      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('id')
        .eq('sender_id', user.id)
        .eq('receiver_id', targetProfile.user_id)
        .single();

      if (existingRequest) {
        toast({
          title: 'Already Sent',
          description: 'You already sent a friend request to this user.',
          variant: 'destructive'
        });
        return;
      }

      // Check if they're already friends
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetProfile.user_id}),and(user1_id.eq.${targetProfile.user_id},user2_id.eq.${user.id})`)
        .single();

      if (existingFriend) {
        toast({
          title: 'Already Friends',
          description: 'You are already friends with this user.',
          variant: 'destructive'
        });
        return;
      }

      // Send friend request
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: targetProfile.user_id
        });

      if (error) throw error;

      toast({
        title: '💝 Friend Request Sent!',
        description: `Sent friend request to ${targetProfile.display_user_id}`,
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send friend request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (isAnimating || currentProfileIndex >= profiles.length) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    // If swiped right (liked), send friend request
    if (direction === 'right') {
      const currentProfile = profiles[currentProfileIndex];
      await sendFriendRequest(currentProfile);
    }

    // Wait for animation
    setTimeout(() => {
      setCurrentProfileIndex(prev => prev + 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const currentProfile = profiles[currentProfileIndex];
  const hasMoreProfiles = currentProfileIndex < profiles.length;

  if (loading) {
    return (
      <div className="pt-20 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding amazing study partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-primary" />
              Find Match
            </h1>
          </div>
          
          <div></div>
        </div>

        {/* Card Stack */}
        <div className="relative h-[600px] mb-8">
          {!hasMoreProfiles ? (
            <Card className="w-full h-full bg-gradient-card border-primary/20 flex items-center justify-center">
              <CardContent className="text-center p-8">
                <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">You've seen everyone!</h3>
                <p className="text-muted-foreground mb-6">
                  Check back later for new study partners, or explore your matches!
                </p>
                <Button variant="outline" onClick={onBack} className="mb-4">
                  <Users className="w-4 h-4 mr-2" />
                  View My Study Squad
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Next card (shown behind) */}
              {profiles[currentProfileIndex + 1] && (
                <Card className="absolute inset-0 w-full h-full bg-gradient-card border-border transform scale-95 opacity-50 rotate-1">
                  <CardContent className="p-0 h-full">
                    <div className="h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg"></div>
                  </CardContent>
                </Card>
              )}

              {/* Current card */}
              <Card 
                className={`absolute inset-0 w-full h-full bg-gradient-card border-primary/30 shadow-2xl transform transition-all duration-300 ${
                  swipeDirection === 'left' 
                    ? '-translate-x-full -rotate-12 opacity-0' 
                    : swipeDirection === 'right'
                    ? 'translate-x-full rotate-12 opacity-0'
                    : 'translate-x-0 rotate-0 opacity-100'
                }`}
              >
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Profile Photo Area */}
                  <div className="flex-1 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-8xl">
                      {currentProfile?.display_user_id ? 
                        String(currentProfile.display_user_id).charAt(0) : '👤'}
                    </div>
                    
                    {/* Overlay indicators */}
                    {swipeDirection === 'right' && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl rotate-12 border-4 border-white">
                          LIKE
                        </div>
                      </div>
                    )}
                    {swipeDirection === 'left' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl -rotate-12 border-4 border-white">
                          PASS
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        User #{currentProfile?.display_user_id}
                      </h2>
                      <div className="flex items-center text-muted-foreground">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        <span className="text-sm">{currentProfile?.course_name}</span>
                      </div>
                    </div>

                    {/* Subjects */}
                    {currentProfile?.subjects && currentProfile.subjects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Subjects
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.subjects.slice(0, 3).map((subject, idx) => (
                            <Badge 
                              key={idx}
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20"
                            >
                              {subject}
                            </Badge>
                          ))}
                          {currentProfile.subjects.length > 3 && (
                            <Badge variant="outline">
                              +{currentProfile.subjects.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Competitive Exams */}
                    {currentProfile?.competitive_exams && currentProfile.competitive_exams.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <Star className="w-4 h-4 mr-2" />
                          Exams
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.competitive_exams.slice(0, 2).map((exam, idx) => (
                            <Badge 
                              key={exam.simple_id || idx}
                              variant="outline"
                              className="bg-secondary/10 border-secondary/20"
                            >
                              {exam.name}
                            </Badge>
                          ))}
                          {currentProfile.competitive_exams.length > 2 && (
                            <Badge variant="outline">
                              +{currentProfile.competitive_exams.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {hasMoreProfiles && (
          <div className="flex justify-center space-x-8">
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:scale-110 transition-all duration-200"
              onClick={() => handleSwipe('left')}
              disabled={isAnimating}
            >
              <X className="w-8 h-8 text-red-500" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-green-500/30 bg-green-500/10 hover:bg-green-500/20 hover:scale-110 transition-all duration-200"
              onClick={() => handleSwipe('right')}
              disabled={isAnimating}
            >
              <Heart className="w-8 h-8 text-green-500" />
            </Button>
          </div>
        )}

        {/* Instructions */}
        {hasMoreProfiles && currentProfileIndex === 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💚 Like • ❌ Pass • Swipe or tap buttons
            </p>
          </div>
        )}

        {/* Friend requests are now handled in the FriendRequests component */}
      </div>
    </div>
  );
};

export default SwipeMatching;