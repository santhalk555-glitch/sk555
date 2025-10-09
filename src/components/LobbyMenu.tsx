import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, UserPlus, Users, BookOpen } from 'lucide-react';

interface LobbyMenuProps {
  onBack: () => void;
  onCreateLobby: () => void;
  onJoinLobby: () => void;
  onPracticeLobby: () => void;
}

const LobbyMenu = ({ onBack, onCreateLobby, onJoinLobby, onPracticeLobby }: LobbyMenuProps) => {
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
              Game Lobby
            </h1>
            <p className="text-muted-foreground">
              Create or join a study session
            </p>
          </div>
          
          <div></div>
        </div>

        {/* Lobby Options */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Lobby */}
          <Card 
            className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
            onClick={onCreateLobby}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                Create Lobby
              </h3>
              <p className="text-muted-foreground mb-4">
                Start a new study session and invite friends
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Join Lobby */}
          <Card 
            className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow relative"
            onClick={onJoinLobby}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                Join Lobby
              </h3>
              <p className="text-muted-foreground mb-4">
                See your invitations and join existing lobbies
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                View Invites
              </Button>
            </CardContent>
          </Card>

          {/* Practice Lobby */}
          <Card 
            className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
            onClick={onPracticeLobby}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                Practice Lobby
              </h3>
              <p className="text-muted-foreground mb-4">
                Practice questions by topic at your own pace
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-12 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Create or Join</h4>
                <p className="text-sm text-muted-foreground">
                  Start a new lobby or join one through invitations
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">Invite Players</h4>
                <p className="text-sm text-muted-foreground">
                  Send invites to friends and wait for them to join
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Start Quiz</h4>
                <p className="text-sm text-muted-foreground">
                  Creator starts the quiz when all players are ready
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LobbyMenu;