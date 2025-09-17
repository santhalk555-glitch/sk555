import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Plus, UserPlus, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubjectSelectionModal from './SubjectSelectionModal';

interface CreateLobbyFlowProps {
  onBack: () => void;
  onLobbyCreated: (lobby: any) => void;
}

interface Lobby {
  id: string;
  lobby_code: string;
  creator_id: string;
  max_players: number;
  current_players: number;
  status: string;
  created_at: string;
  subject?: string;
  game_mode?: string;
}

interface LobbyParticipant {
  slot_number: number;
  username: string;
  user_id: string;
}

const CreateLobbyFlow = ({ onBack, onLobbyCreated }: CreateLobbyFlowProps) => {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGameMode, setSelectedGameMode] = useState<'study' | 'quiz'>('study');
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubjectSelect = (subject: string, maxPlayers: 2 | 4, gameMode: 'study' | 'quiz') => {
    setSelectedSubject(subject);
    setSelectedGameMode(gameMode);
    setShowSubjectModal(false);
    createLobbyWithOptions(subject, maxPlayers, gameMode);
  };

  const createLobbyWithOptions = async (subject: string, maxPlayers: 2 | 4, gameMode: 'study' | 'quiz') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data: lobby, error: lobbyError } = await supabase
        .from('game_lobbies')
        .insert({
          lobby_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          creator_id: user.id,
          max_players: maxPlayers,
          current_players: 1,
          subject: subject,
          game_mode: gameMode
        })
        .select()
        .single();

      if (lobbyError) throw lobbyError;

      const { error: participantError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobby.id,
          user_id: user.id,
          username: profile.username,
          slot_number: 1
        });

      if (participantError) throw participantError;

      setCurrentLobby(lobby);
      setParticipants([{
        slot_number: 1,
        username: profile.username,
        user_id: user.id
      }]);
      
      toast({
        title: 'Lobby Created!',
        description: `${subject} ${gameMode} lobby created with ${maxPlayers} players!`,
      });

      onLobbyCreated(lobby);
    } catch (error) {
      console.error('Error creating lobby:', error);
      toast({
        title: 'Error',
        description: 'Failed to create lobby. Please try again.',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  const startQuiz = async () => {
    if (!currentLobby || !user) return;

    try {
      const { data, error } = await supabase.rpc('start_quiz_lobby', {
        lobby_id: currentLobby.id
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Quiz Started!',
          description: 'The quiz has begun for all participants.',
        });
        loadLobbyData();
      } else {
        toast({
          title: 'Access Denied',
          description: 'Only the lobby creator can start the quiz.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to start quiz. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const loadLobbyData = async () => {
    if (!currentLobby) return;

    const { data, error } = await supabase
      .from('game_lobbies')
      .select('*')
      .eq('id', currentLobby.id)
      .single();

    if (error) {
      console.error('Error loading lobby:', error);
    } else {
      setCurrentLobby(data);
    }
  };

  const invitePlayer = async () => {
    if (!currentLobby || !inviteUserId.trim()) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .eq('username', inviteUserId.trim())
        .single();

      if (profileError || !profile) {
        toast({
          title: 'User Not Found',
          description: 'No user found with that username.',
          variant: 'destructive'
        });
        return;
      }

      if (participants.length >= currentLobby.max_players) {
        toast({
          title: 'Lobby Full',
          description: 'This lobby is already full.',
          variant: 'destructive'
        });
        return;
      }

      const { error: inviteError } = await supabase
        .from('lobby_invites')
        .insert({
          lobby_id: currentLobby.id,
          sender_id: user?.id,
          receiver_id: profile.user_id
        });

      if (inviteError) throw inviteError;

      setInviteUserId('');
      toast({
        title: 'Invite Sent!',
        description: `Sent lobby invite to @${profile.username}`,
      });
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invite. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // If user is in a lobby, show lobby view
  if (currentLobby) {
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Lobby
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Game Lobby
              </h1>
              <p className="text-muted-foreground">
                {participants.length}/{currentLobby.max_players} players
              </p>
            </div>
            
            <div></div>
          </div>

          {/* Lobby Info */}
          <Card className="mb-8 bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2 text-primary" />
                Study Lobby Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {currentLobby.subject || 'No Subject Selected'}
                </div>
                <div className="text-lg text-muted-foreground mb-2">
                  Mode: {currentLobby.game_mode === 'quiz' ? '🏆 Quiz Mode' : '📚 Study Mode'}
                </div>
                <p className="text-muted-foreground">
                  Invite friends using their username
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Players Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Current Players ({participants.length}/{currentLobby.max_players})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div
                    key={participant.user_id}
                    className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">@{participant.username}</div>
                        {participant.user_id === user?.id && (
                          <Badge variant="secondary" className="mt-1">Creator</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: currentLobby.max_players - participants.length }, (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-muted/40 border-dashed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
                        <span className="font-bold text-muted-foreground">{participants.length + index + 1}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Waiting for player...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invite Players Table */}
          {participants.length < currentLobby.max_players && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Invite Players
                </CardTitle>
                <CardDescription>
                  Enter a player's username to send them an invitation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter username to invite..."
                      value={inviteUserId}
                      onChange={(e) => setInviteUserId(e.target.value)}
                      maxLength={20}
                      className="flex-1"
                    />
                    <Button 
                      onClick={invitePlayer} 
                      disabled={!inviteUserId.trim()}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      Send Invite
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>• Players will receive an invitation notification</p>
                    <p>• They can accept or decline your invitation</p>
                    <p>• You have {currentLobby.max_players - participants.length} slots remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz Controls */}
          {currentLobby.game_mode === 'quiz' && currentLobby.creator_id === user?.id && currentLobby.status === 'waiting' && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-primary" />
                  Quiz Controls
                </CardTitle>
                <CardDescription>
                  As the lobby creator, you can start the quiz when ready
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={startQuiz}
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={participants.length < 2}
                >
                  {participants.length < 2 ? 'Need at least 2 players to start' : 'Start Quiz'}
                </Button>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    );
  }

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
            Back to Menu
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Create Lobby
            </h1>
            <p className="text-muted-foreground">
              Choose your subject and game mode to get started
            </p>
          </div>
          
          <div></div>
        </div>

        {/* Create Lobby Button */}
        <div className="max-w-md mx-auto mb-12">
          <Card 
            className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
            onClick={() => setShowSubjectModal(true)}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                Select Subject & Mode
              </h3>
              <p className="text-muted-foreground mb-4">
                Choose your subject and game mode to create lobby
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Subject Selection Modal */}
        <SubjectSelectionModal 
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          onSubjectSelect={handleSubjectSelect}
        />
      </div>
    </div>
  );
};

export default CreateLobbyFlow;