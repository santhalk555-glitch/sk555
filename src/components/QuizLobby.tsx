import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Plus, Crown, Clock, UserPlus, Filter, Search, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import InviteModal from "./InviteModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type QuizSubject = 
  | 'aptitude_quantitative'
  | 'aptitude_reasoning' 
  | 'aptitude_verbal'
  | 'general_science'
  | 'mechanical_engineering'
  | 'civil_engineering'
  | 'electrical_engineering'
  | 'electronics_communication'
  | 'computer_science_it'
  | 'metallurgy'
  | 'chemical_engineering'
  | 'other_engineering';

type DifficultyLevel = 'easy' | 'medium' | 'hard';
type QuizStatus = 'waiting' | 'active' | 'completed';

interface QuizCategory {
  id: string;
  name: string;
  subject: QuizSubject;
  description: string;
}

interface QuizLobby {
  id: string;
  name: string;
  host_id: string;
  subject: QuizSubject;
  difficulty: DifficultyLevel;
  time_limit: number;
  max_players: number;
  current_players: number;
  status: QuizStatus;
  created_at: string;
}

interface QuizLobbyProps {
  onBack: () => void;
}

const subjectLabels: Record<QuizSubject, string> = {
  'aptitude_quantitative': 'Quantitative Aptitude',
  'aptitude_reasoning': 'Logical Reasoning',
  'aptitude_verbal': 'Verbal Ability',
  'general_science': 'General Science',
  'mechanical_engineering': 'Mechanical Engineering',
  'civil_engineering': 'Civil Engineering',
  'electrical_engineering': 'Electrical Engineering',
  'electronics_communication': 'Electronics & Communication',
  'computer_science_it': 'Computer Science & IT',
  'metallurgy': 'Metallurgy',
  'chemical_engineering': 'Chemical Engineering',
  'other_engineering': 'Other Engineering'
};

const QuizLobby = ({ onBack }: QuizLobbyProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState<QuizLobby | null>(null);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [lobbies, setLobbies] = useState<QuizLobby[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTime, setSelectedTime] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New lobby form
  const [newLobby, setNewLobby] = useState({
    name: "",
    subject: "" as QuizSubject,
    difficulty: "medium" as DifficultyLevel,
    timeLimit: 15,
    maxPlayers: 10
  });
  
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    loadLobbies();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('quiz_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz categories",
        variant: "destructive"
      });
    } else {
      setCategories(data || []);
    }
  };

  const loadLobbies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quiz_lobbies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading lobbies:', error);
      toast({
        title: "Error",
        description: "Failed to load lobbies",
        variant: "destructive"
      });
    } else {
      setLobbies(data || []);
    }
    setLoading(false);
  };

  const handleCreateLobby = async () => {
    if (!newLobby.name || !newLobby.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // For now, using a placeholder user_id since we don't have auth yet
    const { data, error } = await supabase
      .from('quiz_lobbies')
      .insert([{
        name: newLobby.name,
        host_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        subject: newLobby.subject,
        difficulty: newLobby.difficulty,
        time_limit: newLobby.timeLimit,
        max_players: newLobby.maxPlayers,
        current_players: 1,
        status: 'waiting' as QuizStatus
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating lobby:', error);
      toast({
        title: "Error",
        description: "Failed to create lobby",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Lobby Created!",
        description: `${newLobby.name} is ready for players.`,
      });
      
      setShowCreateForm(false);
      setNewLobby({ 
        name: "", 
        subject: "" as QuizSubject, 
        difficulty: "medium", 
        timeLimit: 15, 
        maxPlayers: 10 
      });
      loadLobbies(); // Refresh lobbies
    }
  };

  const handleJoinLobby = async (lobby: QuizLobby) => {
    if (lobby.status !== "waiting") {
      toast({
        title: "Cannot Join",
        description: "This lobby is not accepting players.",
        variant: "destructive"
      });
      return;
    }
    
    if (lobby.current_players >= lobby.max_players) {
      toast({
        title: "Lobby Full",
        description: "This lobby is already full.",
        variant: "destructive"
      });
      return;
    }

    // For now, just show success message
    toast({
      title: "Joined Lobby!",
      description: `Welcome to ${lobby.name}`,
    });
  };

  const handleInvite = (lobby: QuizLobby) => {
    setSelectedLobby(lobby);
    setShowInviteModal(true);
  };

  // Filter lobbies based on selected filters
  const filteredLobbies = lobbies.filter(lobby => {
    const matchesSubject = selectedSubject === 'all' || lobby.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || lobby.difficulty === selectedDifficulty;
    const matchesTime = selectedTime === 'all' || 
      (selectedTime === '10' && lobby.time_limit <= 10) ||
      (selectedTime === '15' && lobby.time_limit <= 15) ||
      (selectedTime === '30' && lobby.time_limit <= 30);
    const matchesSearch = lobby.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectLabels[lobby.subject].toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSubject && matchesDifficulty && matchesTime && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-gaming-success/20 text-gaming-success";
      case "medium": return "bg-gaming-warning/20 text-gaming-warning";
      case "hard": return "bg-destructive/20 text-destructive";
      default: return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-gaming-accent/20 text-gaming-accent";
      case "active": return "bg-gaming-warning/20 text-gaming-warning";
      case "completed": return "bg-muted";
      default: return "bg-muted";
    }
  };

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Quiz Battle Arena
            </h1>
            <p className="text-muted-foreground">
              {filteredLobbies.filter(l => l.status === "waiting").length} lobbies waiting for players
            </p>
          </div>
          
          <Button 
            variant="gaming" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="shadow-gaming"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Battle
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-gaming-primary/20 mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Filter className="w-5 h-5 mr-2 text-gaming-accent" />
              Filter Battles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search lobbies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {Object.entries(subjectLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Limit</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Duration</SelectItem>
                    <SelectItem value="10">Up to 10 min</SelectItem>
                    <SelectItem value="15">Up to 15 min</SelectItem>
                    <SelectItem value="30">Up to 30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Lobby Form */}
        {showCreateForm && (
          <Card className="bg-gradient-card border-gaming-primary/20 mb-8 max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2 text-gaming-primary" />
                Create New Battle Arena
              </CardTitle>
              <CardDescription>
                Choose your subject and set the battle parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Battle Name</label>
                  <Input
                    placeholder="e.g. CS Masters Championship"
                    value={newLobby.name}
                    onChange={(e) => setNewLobby({ ...newLobby, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Category</label>
                  <Select 
                    value={newLobby.subject} 
                    onValueChange={(value: QuizSubject) => setNewLobby({ ...newLobby, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(subjectLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select 
                    value={newLobby.difficulty} 
                    onValueChange={(value: DifficultyLevel) => setNewLobby({ ...newLobby, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Limit (minutes)</label>
                  <Input
                    type="number"
                    min={5}
                    max={60}
                    value={newLobby.timeLimit}
                    onChange={(e) => setNewLobby({ ...newLobby, timeLimit: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Players</label>
                  <Select 
                    value={newLobby.maxPlayers.toString()} 
                    onValueChange={(value) => setNewLobby({ ...newLobby, maxPlayers: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                      <SelectItem value="6">6 Players</SelectItem>
                      <SelectItem value="8">8 Players</SelectItem>
                      <SelectItem value="10">10 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="gaming" onClick={handleCreateLobby} className="flex-1">
                  <Trophy className="w-4 h-4 mr-2" />
                  Create Battle Arena
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gradient-card animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Battle Lobbies */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLobbies.map((lobby, index) => (
                <Card 
                  key={lobby.id} 
                  className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300 animate-fade-in hover-scale"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg font-bold">{lobby.name}</CardTitle>
                      <Badge className={getStatusColor(lobby.status)}>
                        {lobby.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-gaming-accent font-medium">
                      {subjectLabels[lobby.subject]}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-gaming-accent" />
                        {lobby.current_players}/{lobby.max_players} players
                      </div>
                      <Badge className={getDifficultyColor(lobby.difficulty)}>
                        {lobby.difficulty.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {lobby.time_limit} minutes
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant={lobby.status === "waiting" ? "gaming" : "outline"}
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleJoinLobby(lobby)}
                        disabled={lobby.status !== "waiting"}
                      >
                        {lobby.status === "waiting" ? "Join Battle" : "In Progress"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInvite(lobby)}
                        className="px-3"
                        disabled={lobby.status !== "waiting"}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredLobbies.length === 0 && !loading && (
              <Card className="bg-gradient-card text-center p-12 max-w-md mx-auto mt-8">
                <CardContent>
                  <Trophy className="w-16 h-16 text-gaming-accent mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Battle Arenas Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedSubject !== 'all' || selectedDifficulty !== 'all' || selectedTime !== 'all' 
                      ? "Try adjusting your filters or create a new battle arena!"
                      : "Be the first to create a quiz battle arena!"
                    }
                  </p>
                  <Button variant="gaming" onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Battle Arena
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <InviteModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        lobby={selectedLobby ? {
          id: selectedLobby.id,
          name: selectedLobby.name,
          host: "Host", // Placeholder since we don't have user names yet
          players: selectedLobby.current_players,
          maxPlayers: selectedLobby.max_players,
          difficulty: selectedLobby.difficulty.charAt(0).toUpperCase() + selectedLobby.difficulty.slice(1) as any,
          subject: subjectLabels[selectedLobby.subject]
        } : null}
      />
    </div>
  );
};

export default QuizLobby;