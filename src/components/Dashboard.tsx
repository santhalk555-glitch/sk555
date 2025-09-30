import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, UserPlus, Crown, Zap, Heart, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SwipeMatching from "./SwipeMatching";
import GameLobby from "./GameLobby";
import MatchedFriends from "./MatchedFriends";
import FriendRequests from "./FriendRequests";
import { RecentActivity } from "./RecentActivity";


const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<"dashboard" | "matching" | "lobby" | "matches" | "requests">("dashboard");
  const [matchedStudents, setMatchedStudents] = useState<any[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileMatchCount, setProfileMatchCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [quizPoints, setQuizPoints] = useState(0);
  const [victoryCount, setVictoryCount] = useState(0);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profile_view')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setHasProfile(!!profile);

      if (profile) {
        // Get count of other profiles for matching
        const { count } = await supabase
          .from('profile_view')
          .select('*', { count: 'exact', head: true })
          .neq('user_id', user.id);
        
        setProfileMatchCount(count || 0);

        // Get count of friends
        const { count: friendsCount } = await supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
        
        setFriendsCount(friendsCount || 0);

        // Get user's quiz points and victory count
        const { data: profileData } = await supabase
          .from('profiles')
          .select('quiz_points, victory_count')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setQuizPoints(profileData.quiz_points || 0);
          setVictoryCount(profileData.victory_count || 0);
        }
      }
    };

    checkUserProfile();
  }, [user]);


  if (activeSection === "matching") {
    return <SwipeMatching onBack={() => setActiveSection("dashboard")} onMatchesUpdate={setMatchedStudents} />;
  }

  if (activeSection === "lobby") {
    return <GameLobby onBack={() => setActiveSection("dashboard")} />;
  }

  if (activeSection === "matches") {
    return <MatchedFriends onBack={() => setActiveSection("dashboard")} />;
  }

  if (activeSection === "requests") {
    return <FriendRequests onBack={() => setActiveSection("dashboard")} />;
  }

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-6 animate-glow-pulse">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            StudyMates Arena
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with study partners and challenge them in epic quiz battles. Level up your learning game!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <Card className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-gaming-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-gaming-accent">
                {hasProfile ? profileMatchCount : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Study Matches</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Zap className="w-8 h-8 text-gaming-warning mx-auto mb-3" />
              <div className="text-2xl font-bold text-gaming-warning">{quizPoints}</div>
              <div className="text-sm text-muted-foreground">Quiz Points</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 text-gaming-success mx-auto mb-3" />
              <div className="text-2xl font-bold text-gaming-success">{victoryCount}</div>
              <div className="text-sm text-muted-foreground">Victories</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Find Match Card */}
          <Card 
            className="bg-gradient-card border-gaming-primary/20 hover:border-gaming-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-gaming hover:shadow-glow"
            onClick={() => hasProfile ? setActiveSection("matching") : navigate('/create-profile')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {hasProfile ? <Heart className="w-8 h-8 text-white" /> : <Settings className="w-8 h-8 text-white" />}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gaming-primary transition-colors duration-300">
                {hasProfile ? 'Find Match' : 'Create Profile'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasProfile 
                  ? `Swipe through ${profileMatchCount} study partners` 
                  : 'Set up your profile to find study partners'
                }
              </p>
              <Button variant="gaming" className="w-full group-hover:shadow-glow transition-all duration-300">
                {hasProfile ? 'Start Swiping' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          {/* My Study Squad Card */}
          <Card 
            className="bg-gradient-card border-gaming-accent/20 hover:border-gaming-accent/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-gaming hover:shadow-glow"
            onClick={() => hasProfile ? setActiveSection("matches") : navigate('/create-profile')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gaming-accent to-gaming-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gaming-accent transition-colors duration-300">My Study Squad</h3>
              <p className="text-muted-foreground mb-4">
                {hasProfile 
                  ? 'View your matched study partners' 
                  : 'Create profile to find matches'
                }
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl font-bold text-gaming-accent">
                  {friendsCount}
                </span>
                <span className="text-sm text-muted-foreground">study partners</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full bg-gaming-accent/10 border-gaming-accent/30 hover:bg-gaming-accent/20 group-hover:shadow-glow transition-all duration-300"
                disabled={!hasProfile}
              >
                {hasProfile ? 'View Squad' : 'Setup Required'}
              </Button>
            </CardContent>
          </Card>

          {/* Create Lobby Card */}
          <Card 
            className="bg-gradient-card border-gaming-secondary/20 hover:border-gaming-secondary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-gaming hover:shadow-glow"
            onClick={() => setActiveSection("lobby")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gaming-secondary to-gaming-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gaming-secondary transition-colors duration-300">Create Lobby</h3>
              <p className="text-muted-foreground mb-4">Create 2 or 4 player lobbies for study sessions</p>
              <Button variant="outline" className="w-full bg-gaming-secondary/10 border-gaming-secondary/30 hover:bg-gaming-secondary/20 group-hover:shadow-glow transition-all duration-300">
                Create Lobby
              </Button>
            </CardContent>
          </Card>

          {/* Friend Requests Card */}
          <Card 
            className="bg-gradient-card border-gaming-warning/20 hover:border-gaming-warning/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-gaming hover:shadow-glow"
            onClick={() => setActiveSection("requests")}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gaming-warning to-gaming-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gaming-warning transition-colors duration-300">Friend Requests</h3>
              <p className="text-muted-foreground mb-4">
                Manage incoming and outgoing friend requests
              </p>
              <Button 
                variant="outline" 
                className="w-full bg-gaming-warning/10 border-gaming-warning/30 hover:bg-gaming-warning/20 group-hover:shadow-glow transition-all duration-300"
              >
                View Requests
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mt-16 max-w-2xl mx-auto">
          <RecentActivity />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;