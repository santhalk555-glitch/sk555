import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Plus, Copy, UserPlus, Crown, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubjectSelectionModal from './SubjectSelectionModal';

interface GameLobbyProps {
  onBack: () => void;
}

interface Lobby {
  id: string;
  lobby_code: string;
  creator_id: string;
  max_players: number;
  current_players: number;
  status: string;
  created_at: string;
}

interface LobbyParticipant {
  slot_number: number;
  display_user_id: string;
  user_id: string;
}

const GameLobby = ({ onBack }: GameLobbyProps) => {
  const [showSubjectModal, setShowSubjectModal] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentLobby, setCurrentLobby] = useState<Lobby | null>(null);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubjectSelect = (subject: string, maxPlayers: 2 | 4) => {
    setSelectedSubject(subject);
    setShowSubjectModal(false);
    createLobby(maxPlayers);
  };

  const createLobby = async (maxPlayers: 2 | 4) => {
    if (!user) return;

    setLoading(true);
    try {
      // Generate lobby code
      const { data: lobbyCode, error: codeError } = await supabase
        .rpc('generate_lobby_code');

      if (codeError) throw codeError;

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_user_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Create lobby
      const { data: lobby, error: lobbyError } = await supabase
        .from('game_lobbies')
        .insert({
          lobby_code: lobbyCode,
          creator_id: user.id,
          max_players: maxPlayers,
          current_players: 1
        })
        .select()
        .single();

      if (lobbyError) throw lobbyError;

      // Add creator as first participant
      const { error: participantError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobby.id,
          user_id: user.id,
          display_user_id: profile.display_user_id,
          slot_number: 1
        });

      if (participantError) throw participantError;

      setCurrentLobby(lobby);
      setParticipants([{
        slot_number: 1,
        display_user_id: profile.display_user_id,
        user_id: user.id
      }]);
      toast({
        title: 'Lobby Created!',
        description: `Lobby ${lobbyCode} is ready for ${maxPlayers} players.`,
      });
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

  const invitePlayer = async () => {
    if (!currentLobby || !inviteUserId.trim()) return;

    try {
      // Check if user exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_user_id')
        .eq('display_user_id', inviteUserId.trim())
        .single();

      if (profileError || !profile) {
        toast({
          title: 'User Not Found',
          description: 'No user found with that User ID.',
          variant: 'destructive'
        });
        return;
      }

      // Check if user is already in lobby
      const { data: existingParticipant } = await supabase
        .from('lobby_participants')
        .select('id')
        .eq('lobby_id', currentLobby.id)
        .eq('user_id', profile.user_id)
        .single();

      if (existingParticipant) {
        toast({
          title: 'Already Joined',
          description: 'This user is already in the lobby.',
          variant: 'destructive'
        });
        return;
      }

      // Check if lobby is full
      if (participants.length >= currentLobby.max_players) {
        toast({
          title: 'Lobby Full',
          description: 'This lobby is already full.',
          variant: 'destructive'
        });
        return;
      }

      // Add participant
      const nextSlot = Math.min(...Array.from({length: currentLobby.max_players}, (_, i) => i + 1)
        .filter(slot => !participants.some(p => p.slot_number === slot)));

      const { error: insertError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: currentLobby.id,
          user_id: profile.user_id,
          display_user_id: profile.display_user_id,
          slot_number: nextSlot
        });

      if (insertError) throw insertError;

      // Update lobby player count
      const { error: updateError } = await supabase
        .from('game_lobbies')
        .update({ current_players: participants.length + 1 })
        .eq('id', currentLobby.id);

      if (updateError) throw updateError;

      // Refresh participants
      loadParticipants();
      setInviteUserId('');

      toast({
        title: 'Player Invited!',
        description: `${profile.display_user_id} has joined the lobby.`,
      });
    } catch (error) {
      console.error('Error inviting player:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite player. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const loadParticipants = async () => {
    if (!currentLobby) return;

    const { data, error } = await supabase
      .from('lobby_participants')
      .select('slot_number, display_user_id, user_id')
      .eq('lobby_id', currentLobby.id)
      .order('slot_number');

    if (error) {
      console.error('Error loading participants:', error);
    } else {
      setParticipants(data || []);
    }
  };

  const copyLobbyCode = () => {
    if (currentLobby) {
      navigator.clipboard.writeText(currentLobby.lobby_code);
      toast({
        title: 'Copied!',
        description: 'Lobby code copied to clipboard.',
      });
    }
  };

  const leaveLobby = () => {
    setCurrentLobby(null);
    setParticipants([]);
    setInviteUserId('');
    setShowSubjectModal(true);
    setSelectedSubject('');
  };

  const handleBackToMenu = () => {
    if (currentLobby) {
      leaveLobby();
    } else {
      onBack();
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
              onClick={handleBackToMenu}
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
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-primary" />
                  Lobby Code
                </span>
                <Button variant="outline" size="sm" onClick={copyLobbyCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold font-mono text-primary mb-2">
                  {currentLobby.lobby_code}
                </div>
                <p className="text-muted-foreground">
                  Share this code with friends to join
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Player Slots */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Players ({participants.length}/{currentLobby.max_players})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-${currentLobby.max_players === 2 ? '2' : '2'} md:grid-cols-${currentLobby.max_players} gap-4`}>
                {Array.from({ length: currentLobby.max_players }, (_, index) => {
                  const slot = index + 1;
                  const participant = participants.find(p => p.slot_number === slot);
                  
                  return (
                    <div
                      key={slot}
                      className={`p-4 rounded-lg border-2 border-dashed transition-all ${
                        participant 
                          ? 'border-primary bg-primary/10' 
                          : 'border-muted bg-muted/20'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-2">
                          Slot {slot}
                          {participant?.user_id === user?.id && (
                            <Badge variant="secondary" className="ml-2">You</Badge>
                          )}
                        </div>
                        {participant ? (
                          <div className="text-2xl font-mono font-bold text-primary">
                            {participant.display_user_id}
                          </div>
                        ) : (
                          <div className="text-muted-foreground">
                            Waiting for player...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Invite Player */}
          {participants.length < currentLobby.max_players && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Invite Player
                </CardTitle>
                <CardDescription>
                  Enter a player's 8-digit User ID to invite them
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="12345678"
                    value={inviteUserId}
                    onChange={(e) => setInviteUserId(e.target.value)}
                    maxLength={8}
                  />
                  <Button onClick={invitePlayer} disabled={!inviteUserId.trim()}>
                    Invite
                  </Button>
                </div>
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
            onClick={handleBackToMenu}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Create Lobby
            </h1>
            <p className="text-muted-foreground">
              Choose your lobby type to get started
            </p>
          </div>
          
          <div></div>
        </div>

        {/* Create Lobby Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card 
            className="bg-gradient-card border-primary/20 hover:border-primary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
            onClick={() => createLobby(2)}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                2-Player Lobby
              </h3>
              <p className="text-muted-foreground mb-4">
                Perfect for 1-on-1 study sessions and quick challenges
              </p>
              <Badge variant="secondary" className="mb-4">Recommended</Badge>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create 2-Player Lobby'}
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-card border-secondary/20 hover:border-secondary/40 cursor-pointer transform hover:scale-105 transition-all duration-300 group shadow-lg hover:shadow-glow"
            onClick={() => createLobby(4)}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-secondary to-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-secondary transition-colors duration-300">
                4-Player Lobby
              </h3>
              <p className="text-muted-foreground mb-4">
                Great for group study sessions and team challenges
              </p>
              <Badge variant="outline" className="mb-4">Group Fun</Badge>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create 4-Player Lobby'}
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
                <h4 className="font-semibold mb-2">Create Lobby</h4>
                <p className="text-sm text-muted-foreground">
                  Choose between 2 or 4 player lobby and get your lobby code
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">Invite Friends</h4>
                <p className="text-sm text-muted-foreground">
                  Share your lobby code or invite players using their 8-digit User ID
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Start Playing</h4>
                <p className="text-sm text-muted-foreground">
                  Once all players join, start your study session or quiz challenge
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Selection Modal - only shown in Create Lobby screen */}
        <SubjectSelectionModal 
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          onSubjectSelect={handleSubjectSelect}
        />
      </div>
    </div>
  );
};

export default GameLobby;