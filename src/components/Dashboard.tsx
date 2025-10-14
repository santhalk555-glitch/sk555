import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, UserPlus, Crown, Zap, Heart, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SwipeMatching from "./SwipeMatching";
import GameLobby from "./GameLobby";
import MatchedFriends from "./MatchedFriends";
import FriendRequests from "./FriendRequests";
import { RecentActivity } from "./RecentActivity";
import heroImage from "@/assets/hero-studymates.jpg";


const Dashboard = () => {
  const [activeSection, setActiveSection] = useState<"dashboard" | "matching" | "lobby" | "matches" | "requests">("dashboard");
  const [matchedStudents, setMatchedStudents] = useState<any[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [profileMatchCount, setProfileMatchCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0);
  const [quizPoints, setQuizPoints] = useState(0);
  const [victoryCount, setVictoryCount] = useState(0);
  const [lobbyState, setLobbyState] = useState<any>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle navigation from notifications
  useEffect(() => {
    const state = location.state as any;
    console.log('Dashboard received state:', state);
    if (state?.openJoinLobby) {
      console.log('Opening lobby with join state');
      setLobbyState({ openJoinLobby: true });
      setActiveSection('lobby');
      // Clear the state
      navigate('/', { replace: true, state: {} });
    } else if (state?.openFriendRequests) {
      setActiveSection('requests');
      // Clear the state
      navigate('/', { replace: true, state: {} });
    }
  }, [location, navigate]);

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
    return <GameLobby onBack={() => { setActiveSection("dashboard"); setLobbyState(null); }} initialView={lobbyState?.openJoinLobby ? 'join' : undefined} />;
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
        <div className="relative text-center mb-12 mt-8 rounded-3xl overflow-hidden shadow-glow">
          {/* Background with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroImage} 
              alt="Students collaborating and studying together" 
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/90 to-gaming-secondary/10"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 py-16 px-6 animate-fade-in">
            {/* Crown with Glow Effect */}
            <div className="relative inline-block mb-8 animate-scale-in">
              <div className="absolute inset-0 bg-gradient-primary blur-xl opacity-60 rounded-full scale-150"></div>
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-primary shadow-glow animate-pulse-slow">
                <Crown className="w-12 h-12 text-primary-foreground drop-shadow-lg" />
              </div>
            </div>
            
            {/* Title with Gradient and Shadow */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gaming-primary via-primary to-gaming-secondary bg-clip-text text-transparent leading-tight animate-slide-up" style={{ textShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}>
              StudyMates Arena
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto mb-4 font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Connect with study partners and challenge them in epic quiz battles. Level up your learning game!
            </p>
            
            {/* Secondary Text */}
            <p className="text-base text-muted-foreground max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Challenge your friends. Sharpen your mind. Win rewards.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-10">
           <Card className="bg-gradient-card border-border hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl group animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gaming-accent/10 mb-4 group-hover:bg-gaming-accent/20 transition-colors duration-300">
                <Heart className="w-8 h-8 text-gaming-accent group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-gaming-accent mb-2">
                {hasProfile ? profileMatchCount : '0'}
              </div>
              <div className="text-sm font-medium text-muted-foreground">Study Matches</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl group animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gaming-warning/10 mb-4 group-hover:bg-gaming-warning/20 transition-colors duration-300">
                <Zap className="w-8 h-8 text-gaming-warning group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-gaming-warning mb-2">{quizPoints}</div>
              <div className="text-sm font-medium text-muted-foreground">Quiz Points</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl group animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gaming-success/10 mb-4 group-hover:bg-gaming-success/20 transition-colors duration-300">
                <Crown className="w-8 h-8 text-gaming-success group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-3xl font-bold text-gaming-success mb-2">{victoryCount}</div>
              <div className="text-sm font-medium text-muted-foreground">Victories</div>
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
                  ? 'Swipe through study partners and send friend requests' 
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
                  ? 'View your accepted study partners (friends)' 
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
              <h3 className="text-xl font-bold mb-2 group-hover:text-gaming-secondary transition-colors duration-300">Lobby</h3>
              <p className="text-muted-foreground mb-4">Create a 2-player, 4-player, or practice lobby for quizzes</p>
              <Button variant="outline" className="w-full bg-gaming-secondary/10 border-gaming-secondary/30 hover:bg-gaming-secondary/20 group-hover:shadow-glow transition-all duration-300">
                Lobby
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