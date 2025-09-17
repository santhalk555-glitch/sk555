import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Plus, UserPlus, Crown, Play, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LobbyWaitingRoomProps {
  lobby: any;
  onBack: () => void;
  onQuizStarted: (lobby: any) => void;
}

interface LobbyParticipant {
  slot_number: number;
  username: string;
  user_id: string;
}

const LobbyWaitingRoom = ({ lobby: initialLobby, onBack, onQuizStarted }: LobbyWaitingRoomProps) => {
  const [lobby, setLobby] = useState(initialLobby);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isCreator = user?.id === lobby?.creator_id;

  // Load participants and set up real-time subscriptions
  useEffect(() => {
    if (lobby) {
      loadParticipants();
      
      // Set up real-time subscription for participants
      const participantsChannel = supabase
        .channel(`lobby-participants-${lobby.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'lobby_participants',
            filter: `lobby_id=eq.${lobby.id}`
          },
          (payload) => {
            console.log('New participant joined:', payload);
            loadParticipants();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'lobby_participants',
            filter: `lobby_id=eq.${lobby.id}`
          },
          (payload) => {
            console.log('Participant updated:', payload);
            loadParticipants();
          }
        )
        .subscribe();

      // Set up real-time subscription for lobby status changes
      const lobbyChannel = supabase
        .channel(`lobby-${lobby.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'game_lobbies',
            filter: `id=eq.${lobby.id}`
          },
          (payload) => {
            console.log('Lobby updated:', payload);
            const updatedLobby = payload.new;
            setLobby(updatedLobby);
            
            // If quiz started, redirect all participants
            if (updatedLobby.status === 'in_progress') {
              onQuizStarted(updatedLobby);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(participantsChannel);
        supabase.removeChannel(lobbyChannel);
      };
    }
  }, [lobby, onQuizStarted]);

  const loadParticipants = async () => {
    if (!lobby) return;

    try {
      console.log('Loading participants for lobby:', lobby.id);
      const { data, error } = await supabase
        .from('lobby_participants')
        .select('*')
        .eq('lobby_id', lobby.id)
        .order('slot_number');

      console.log('Participants loaded:', { data, error });
      if (error) throw error;

      if (data) {
        setParticipants(data);
        
        // Update lobby player count
        setLobby(prev => prev ? { ...prev, current_players: data.length } : null);
        
        console.log('Updated participants state:', data);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const startQuiz = async () => {
    if (!lobby || !user || !isCreator) return;

    try {
      // First, create quiz participants for all lobby participants
      const { data: lobbyParticipants, error: participantsError } = await supabase
        .from('lobby_participants')
        .select('*')
        .eq('lobby_id', lobby.id);

      if (participantsError) throw participantsError;

      // Insert into quiz_participants table
      if (lobbyParticipants) {
        const quizParticipants = lobbyParticipants.map(p => ({
          lobby_id: lobby.id,
          user_id: p.user_id,
          score: 0,
          answers: []
        }));

        const { error: insertError } = await supabase
          .from('quiz_participants')
          .insert(quizParticipants);

        if (insertError) {
          console.log('Quiz participants may already exist:', insertError);
        }
      }

      // Start the quiz
      const { data, error } = await supabase.rpc('start_quiz_lobby', {
        lobby_id: lobby.id
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Quiz Started!',
          description: 'The quiz has begun for all participants.',
        });
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

  const invitePlayer = async () => {
    if (!lobby || !inviteUserId.trim() || !isCreator) return;

    console.log('Inviting player:', inviteUserId.trim(), 'to lobby:', lobby.id);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .eq('username', inviteUserId.trim())
        .single();

      console.log('Profile lookup result:', { profile, profileError });

      if (profileError || !profile) {
        console.log('Profile not found for username:', inviteUserId.trim());
        toast({
          title: 'User Not Found',
          description: 'No user found with that username.',
          variant: 'destructive'
        });
        return;
      }

      console.log('Checking lobby capacity. Current participants:', participants.length, 'Max:', lobby.max_players);
      if (participants.length >= lobby.max_players) {
        console.log('Lobby is full');
        toast({
          title: 'Lobby Full',
          description: 'This lobby is already full.',
          variant: 'destructive'
        });
        return;
      }

      console.log('Sending invite with data:', {
        lobby_id: lobby.id,
        sender_id: user?.id,
        receiver_id: profile.user_id
      });

      const { error: inviteError } = await supabase
        .from('lobby_invites')
        .insert({
          lobby_id: lobby.id,
          sender_id: user?.id,
          receiver_id: profile.user_id
        });

      console.log('Invite creation result:', { inviteError });

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
              {participants.length}/{lobby.max_players} players
            </p>
          </div>
          
          <div></div>
        </div>

        {/* Lobby Info */}
        <Card className="mb-8 bg-gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              {isCreator ? (
                <>
                  <Crown className="w-5 h-5 mr-2 text-primary" />
                  Your Lobby
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Joined Lobby
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {lobby.subject || 'No Subject Selected'}
              </div>
              <div className="text-lg text-muted-foreground mb-2">
                Mode: {lobby.game_mode === 'quiz' ? '🏆 Quiz Mode' : '📚 Study Mode'}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Lobby Code: <span className="font-mono bg-muted px-2 py-1 rounded">{lobby.lobby_code}</span>
              </div>
              <Badge variant={lobby.status === 'waiting' ? 'default' : 'secondary'}>
                {lobby.status === 'waiting' ? 'Waiting for Players' : lobby.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Current Players Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Current Players ({participants.length}/{lobby.max_players})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Create an array for all slots */}
              {Array.from({ length: lobby.max_players }, (_, slotIndex) => {
                const slotNumber = slotIndex + 1;
                const participant = participants.find(p => p.slot_number === slotNumber);
                
                if (participant) {
                  // Occupied slot
                  return (
                    <div
                      key={participant.user_id}
                      className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-bold text-primary">{slotNumber}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">@{participant.username}</div>
                          {participant.user_id === lobby.creator_id && (
                            <Badge variant="secondary" className="mt-1">Creator</Badge>
                          )}
                          {participant.user_id === user?.id && participant.user_id !== lobby.creator_id && (
                            <Badge variant="outline" className="mt-1">You</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Slot {slotNumber}
                      </div>
                    </div>
                  );
                } else {
                  // Empty slot
                  return (
                    <div
                      key={`empty-${slotNumber}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-muted/40 border-dashed"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-muted/40 flex items-center justify-center">
                          <span className="font-bold text-muted-foreground">{slotNumber}</span>
                        </div>
                        <div className="text-muted-foreground">
                          Waiting for player...
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Slot {slotNumber}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </CardContent>
        </Card>

        {/* Creator Controls */}
        {isCreator && (
          <>
            {/* Invite Players */}
            {participants.length < lobby.max_players && lobby.status === 'waiting' && (
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
                      <p>• You have {lobby.max_players - participants.length} slots remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz Controls */}
            {lobby.game_mode === 'quiz' && lobby.status === 'waiting' && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-primary" />
                    Quiz Controls
                  </CardTitle>
                  <CardDescription>
                    Start the quiz when ready
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Button
                        onClick={startQuiz}
                        disabled={loading || participants.length < 2}
                        className="bg-gradient-primary hover:opacity-90 min-w-[200px]"
                        size="lg"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Quiz
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-center">
                      {participants.length < 2 ? (
                        <p>Need at least 2 players to start the quiz</p>
                      ) : (
                        <p>All participants will be taken to the quiz when you start</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Participant Waiting Message */}
        {!isCreator && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Waiting for Game to Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  The lobby creator will start the {lobby.game_mode === 'quiz' ? 'quiz' : 'study session'} when ready.
                </p>
                {lobby.game_mode === 'quiz' && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-primary font-medium">
                      🏆 Quiz Mode Active
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get ready to answer questions about {lobby.subject}!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LobbyWaitingRoom;