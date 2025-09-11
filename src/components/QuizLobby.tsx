import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Plus, Crown, Clock, UserPlus, Copy } from "lucide-react";
import { useState } from "react";
import InviteModal from "./InviteModal";
import { useToast } from "@/hooks/use-toast";

interface Lobby {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  difficulty: "Easy" | "Medium" | "Hard";
  subject: string;
  status: "Waiting" | "In Progress" | "Finished";
  timeLimit: number;
}

const mockLobbies: Lobby[] = [
  {
    id: "1",
    name: "CS Quiz Battle",
    host: "Emma R.",
    players: 2,
    maxPlayers: 4,
    difficulty: "Hard",
    subject: "Computer Science",
    status: "Waiting",
    timeLimit: 15
  },
  {
    id: "2",
    name: "Math Showdown",
    host: "David K.",
    players: 1,
    maxPlayers: 2,
    difficulty: "Medium",
    subject: "Mathematics",
    status: "Waiting",
    timeLimit: 10
  },
  {
    id: "3",
    name: "Biology Masters",
    host: "Sophia C.",
    players: 3,
    maxPlayers: 4,
    difficulty: "Easy",
    subject: "Biology",
    status: "In Progress",
    timeLimit: 20
  }
];

interface QuizLobbyProps {
  onBack: () => void;
}

const QuizLobby = ({ onBack }: QuizLobbyProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);
  const [newLobby, setNewLobby] = useState({
    name: "",
    maxPlayers: 2,
    difficulty: "Medium" as const,
    subject: "",
    timeLimit: 15
  });
  const { toast } = useToast();

  const handleCreateLobby = () => {
    if (!newLobby.name || !newLobby.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Lobby Created!",
      description: `${newLobby.name} is ready for players.`,
    });
    
    setShowCreateForm(false);
    setNewLobby({ name: "", maxPlayers: 2, difficulty: "Medium", subject: "", timeLimit: 15 });
  };

  const handleJoinLobby = (lobby: Lobby) => {
    if (lobby.status === "In Progress") {
      toast({
        title: "Cannot Join",
        description: "This lobby is already in progress.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Joined Lobby!",
      description: `Welcome to ${lobby.name}`,
    });
  };

  const handleInvite = (lobbyId: string) => {
    const lobby = mockLobbies.find(l => l.id === lobbyId);
    setSelectedLobby(lobby || null);
    setShowInviteModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-gaming-success/20 text-gaming-success";
      case "Medium": return "bg-gaming-warning/20 text-gaming-warning";
      case "Hard": return "bg-destructive/20 text-destructive";
      default: return "bg-muted";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Waiting": return "bg-gaming-accent/20 text-gaming-accent";
      case "In Progress": return "bg-gaming-warning/20 text-gaming-warning";
      case "Finished": return "bg-muted";
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
            <h1 className="text-2xl font-bold mb-2">Quiz Arena</h1>
            <p className="text-muted-foreground">
              {mockLobbies.filter(l => l.status === "Waiting").length} lobbies waiting for players
            </p>
          </div>
          
          <Button 
            variant="gaming" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="shadow-gaming"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Lobby
          </Button>
        </div>

        {/* Create Lobby Form */}
        {showCreateForm && (
          <Card className="bg-gradient-card border-gaming-primary/20 mb-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2 text-gaming-primary" />
                Create New Lobby
              </CardTitle>
              <CardDescription>
                Set up your quiz battle arena
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Lobby Name</label>
                  <Input
                    placeholder="Enter lobby name"
                    value={newLobby.name}
                    onChange={(e) => setNewLobby({ ...newLobby, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    placeholder="e.g. Computer Science"
                    value={newLobby.subject}
                    onChange={(e) => setNewLobby({ ...newLobby, subject: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Players</label>
                  <select 
                    className="w-full p-2 rounded-md bg-input border border-border"
                    value={newLobby.maxPlayers}
                    onChange={(e) => setNewLobby({ ...newLobby, maxPlayers: Number(e.target.value) })}
                  >
                    <option value={2}>2 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <select 
                    className="w-full p-2 rounded-md bg-input border border-border"
                    value={newLobby.difficulty}
                    onChange={(e) => setNewLobby({ ...newLobby, difficulty: e.target.value as any })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Limit (min)</label>
                  <Input
                    type="number"
                    min={5}
                    max={30}
                    value={newLobby.timeLimit}
                    onChange={(e) => setNewLobby({ ...newLobby, timeLimit: Number(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button variant="gaming" onClick={handleCreateLobby} className="flex-1">
                  <Crown className="w-4 h-4 mr-2" />
                  Create Lobby
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Lobbies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockLobbies.map((lobby, index) => (
            <Card 
              key={lobby.id} 
              className="bg-gradient-card border-border hover:shadow-gaming transition-all duration-300 animate-slide-in"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{lobby.name}</CardTitle>
                  <Badge className={getStatusColor(lobby.status)}>
                    {lobby.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center text-sm">
                  <Crown className="w-4 h-4 mr-1" />
                  Hosted by {lobby.host}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gaming-accent" />
                    {lobby.players}/{lobby.maxPlayers} players
                  </div>
                  <Badge className={getDifficultyColor(lobby.difficulty)}>
                    {lobby.difficulty}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {lobby.timeLimit} min • {lobby.subject}
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant={lobby.status === "Waiting" ? "gaming" : "outline"}
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleJoinLobby(lobby)}
                    disabled={lobby.status !== "Waiting"}
                  >
                    {lobby.status === "Waiting" ? "Join" : "In Progress"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleInvite(lobby.id)}
                    className="px-3"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockLobbies.length === 0 && (
          <Card className="bg-gradient-card text-center p-12 max-w-md mx-auto mt-8">
            <CardContent>
              <Users className="w-12 h-12 text-gaming-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Lobbies</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a quiz lobby!
              </p>
              <Button variant="gaming" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Lobby
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <InviteModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        lobby={selectedLobby}
      />
    </div>
  );
};

export default QuizLobby;