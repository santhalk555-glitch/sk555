import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Star, MapPin, MessageCircle, Video, BookOpen, Users, MoreVertical, Ban, Flag, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Chat from "./Chat";
import BanUserDialog from "./BanUserDialog";
import ReportUserDialog from "./ReportUserDialog";
import { Profile, parseCompetitiveExams } from '@/types/profile';
import { usePresence, useUserPresence } from "@/hooks/usePresence";
import PresenceDot from "./PresenceDot";
import PresenceStatusText from "./PresenceStatusText";

interface MatchedFriendsProps {
  onBack: () => void;
}

const MatchedFriends = ({ onBack }: MatchedFriendsProps) => {
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null);
  const [chatFriend, setChatFriend] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const { user } = useAuth();
  
  // Initialize presence tracking for current user
  usePresence();
  
  // Get presence data for all friends
  const friendIds = useMemo(() => friends.map(f => f.user_id), [friends]);
  const presenceMap = useUserPresence(friendIds);
  
  // Filter friends based on online status
  const filteredFriends = useMemo(() => {
    if (!showOnlineOnly) return friends;
    return friends.filter(f => presenceMap[f.user_id]?.status === 'online');
  }, [friends, showOnlineOnly, presenceMap]);
  
  // Count online friends
  const onlineCount = useMemo(() => {
    return friends.filter(f => presenceMap[f.user_id]?.status === 'online').length;
  }, [friends, presenceMap]);

  useEffect(() => {
    loadFriends();
    setupRealtimeListeners();
  }, [user]);

  const setupRealtimeListeners = () => {
    if (!user) return;

    // Listen for changes in friends table
    const channel = supabase
      .channel('friends-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `user1_id=eq.${user.id}`
        },
        () => loadFriends()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `user2_id=eq.${user.id}`
        },
        () => loadFriends()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadFriends = async () => {
    if (!user) return;

    try {
      // Get list of banned users first
      const { data: bannedData } = await supabase
        .from('banned_users')
        .select('banned_user_id')
        .eq('user_id', user.id);
      
      const bannedUserIds = bannedData?.map(b => b.banned_user_id) || [];

      // Load accepted friends from the friends table
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;

      // Transform the data to get friend profiles
      const friendProfiles: Profile[] = [];
      
      // For each friendship, get the profile of the other user
      for (const friendship of friendships || []) {
        const otherUserId = friendship.user1_id === user.id ? friendship.user2_id : friendship.user1_id;
        
        // Skip banned users
        if (bannedUserIds.includes(otherUserId)) continue;
        
        const { data: profile, error: profileError } = await supabase
          .from('profile_view')
          .select('*')
          .eq('user_id', otherUserId)
          .single();
          
        if (profile && !profileError) {
          const parsedProfile = {
            ...profile,
            competitive_exams: parseCompetitiveExams(profile.competitive_exams)
          };
          friendProfiles.push(parsedProfile);
        }
      }

      console.log('Loaded friends:', friendProfiles);
      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (chatFriend) {
    return <Chat friend={chatFriend as any} onBack={() => setChatFriend(null)} />;
  }

  if (loading) {
    return (
      <div className="pt-20 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your study squad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matching
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Your Study Squad ✨
            </h1>
            <p className="text-muted-foreground">
              <span className="text-green-600 dark:text-green-500 font-semibold">{onlineCount} online</span> • {friends.length} total
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={showOnlineOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              {showOnlineOnly ? 'Show All' : 'Online Only'}
            </Button>
            <div className="flex items-center space-x-2 bg-gaming-primary/10 px-4 py-2 rounded-full">
              <Users className="w-5 h-5 text-gaming-primary" />
              <span className="text-sm font-bold text-gaming-primary">{filteredFriends.length}</span>
            </div>
          </div>
        </div>

        {friends.length === 0 ? (
          <Card className="bg-gradient-card text-center p-12 max-w-md mx-auto">
            <CardContent>
              <Heart className="w-16 h-16 text-gaming-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">No matches yet!</h3>
              <p className="text-muted-foreground mb-6">
                Start swiping to find your perfect study partners
              </p>
              <Button variant="gaming" onClick={onBack}>
                Find Study Partners
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map((match, index) => {
              const presence = presenceMap[match.user_id];
              return (
              <Card 
                key={match.id}
                className="bg-gradient-card border-gaming-primary/30 hover:border-gaming-primary/60 transform hover:scale-105 transition-all duration-500 group shadow-gaming hover:shadow-glow animate-fade-in"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <CardHeader className="text-center pb-4 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(match);
                          setBanDialogOpen(true);
                        }}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Ban User
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(match);
                          setReportDialogOpen(true);
                        }}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Report User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-3xl group-hover:scale-110 transition-transform duration-300 shadow-glow">
                    {match.username ? match.username.charAt(0).toUpperCase() : '👤'}
                    <div className="absolute top-0 right-0">
                      <PresenceDot 
                        status={presence?.status || null}
                        lastSeen={presence?.last_seen}
                        size="md"
                      />
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl mb-1 group-hover:text-gaming-primary transition-colors duration-300">
                    @{match.username}
                  </CardTitle>
                  <PresenceStatusText 
                    status={presence?.status || null}
                    lastSeen={presence?.last_seen}
                  />
                  
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="w-4 h-4 text-gaming-warning fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {match.course_name}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Study Partner
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Exams:</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {match.competitive_exams && match.competitive_exams.slice(0, 1).map((exam, idx) => (
                          <Badge 
                            key={exam.simple_id || idx} 
                            variant="outline"
                            className="text-xs bg-gaming-secondary/10 border-gaming-secondary/20"
                          >
                            {exam.name}
                          </Badge>
                        ))}
                      {match.competitive_exams && match.competitive_exams.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.competitive_exams.length - 1}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="gaming" 
                        size="sm" 
                        className="flex-1 group-hover:shadow-glow transition-all duration-300"
                        onClick={() => setChatFriend(match)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gaming-secondary/10 border-gaming-secondary/30 hover:bg-gaming-secondary/20"
                      >
                        <Video className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}

        {/* Quick Actions */}
        {friends.length > 0 && (
          <div className="mt-12 text-center">
            <Card className="bg-gradient-card border-gaming-primary/20 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Ready to study together?</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="gaming" className="shadow-glow">
                    <Users className="w-4 h-4 mr-2" />
                    Create Study Group
                  </Button>
                  <Button variant="outline" className="bg-gaming-secondary/10 border-gaming-secondary/30">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ban & Report Dialogs */}
        {selectedUser && (
          <>
            <BanUserDialog
              open={banDialogOpen}
              onOpenChange={setBanDialogOpen}
              userId={selectedUser.user_id}
              username={selectedUser.username}
              onBanComplete={loadFriends}
            />
            <ReportUserDialog
              open={reportDialogOpen}
              onOpenChange={setReportDialogOpen}
              userId={selectedUser.user_id}
              username={selectedUser.username}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MatchedFriends;