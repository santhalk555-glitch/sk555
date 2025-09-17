import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Clock, Check, X, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface JoinLobbyFlowProps {
  onBack: () => void;
  onJoinLobby: (lobby: any) => void;
}

interface LobbyInvite {
  id: string;
  lobby_id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  responded_at: string | null;
  game_lobbies: {
    subject: string;
    game_mode: string;
    max_players: number;
    current_players: number;
    lobby_code: string;
    status: string;
  };
  sender_profile: {
    username: string;
  };
}

const JoinLobbyFlow = ({ onBack, onJoinLobby }: JoinLobbyFlowProps) => {
  const [invites, setInvites] = useState<LobbyInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lobby_invites')
        .select(`
          *,
          game_lobbies (
            subject,
            game_mode,
            max_players,
            current_players,
            lobby_code,
            status
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get sender profiles separately
      const senderIds = data?.map(invite => invite.sender_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', senderIds);

      // Transform the data to match our interface
      const transformedInvites = data?.map((invite: any) => ({
        ...invite,
        sender_profile: profiles?.find(p => p.user_id === invite.sender_id) || { username: 'Unknown' },
      })) || [];

      setInvites(transformedInvites);
    } catch (error) {
      console.error('Error loading invites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const respondToInvite = async (inviteId: string, response: 'accepted' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('lobby_invites')
        .update({ 
          status: response,
          responded_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      if (response === 'accepted') {
        // Find the invite to get lobby details
        const invite = invites.find(inv => inv.id === inviteId);
        if (invite) {
          // Get user profile to join lobby
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', user?.id)
            .single();

          if (profileError) throw profileError;

          // Find next available slot
          const { data: participants, error: participantsError } = await supabase
            .from('lobby_participants')
            .select('slot_number')
            .eq('lobby_id', invite.lobby_id)
            .order('slot_number');

          if (participantsError) throw participantsError;

          const occupiedSlots = participants?.map(p => p.slot_number) || [];
          let nextSlot = 1;
          for (let i = 1; i <= invite.game_lobbies.max_players; i++) {
            if (!occupiedSlots.includes(i)) {
              nextSlot = i;
              break;
            }
          }

          // Join the lobby
          const { error: joinError } = await supabase
            .from('lobby_participants')
            .insert({
              lobby_id: invite.lobby_id,
              user_id: user?.id,
              username: profile.username,
              slot_number: nextSlot
            });

          if (joinError) throw joinError;

          // Update lobby current players count
          const { error: lobbyUpdateError } = await supabase
            .from('game_lobbies')
            .update({ 
              current_players: invite.game_lobbies.current_players + 1 
            })
            .eq('id', invite.lobby_id);

          if (lobbyUpdateError) throw lobbyUpdateError;

          toast({
            title: 'Joined Lobby!',
            description: `You've joined ${invite.sender_profile.username}'s lobby.`,
          });

          // Navigate to the lobby
          onJoinLobby({
            id: invite.lobby_id,
            ...invite.game_lobbies
          });
        }
      } else {
        toast({
          title: 'Invite Rejected',
          description: 'You have declined the lobby invitation.',
        });
      }

      // Remove the invite from the list
      setInvites(prevInvites => prevInvites.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error('Error responding to invite:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to invitation.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">Loading invitations...</p>
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
              Join Lobby
            </h1>
            <p className="text-muted-foreground">
              Your pending lobby invitations
            </p>
          </div>
          
          <div></div>
        </div>

        {/* Invites List */}
        {invites.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Invitations</h3>
              <p className="text-muted-foreground">
                You don't have any pending lobby invitations at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {invites.map((invite) => (
              <Card key={invite.id} className="bg-gradient-card border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-primary" />
                      Lobby Invitation
                    </CardTitle>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                    </Badge>
                  </div>
                  <CardDescription>
                    From <strong>@{invite.sender_profile.username}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Lobby Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Subject</div>
                        <div className="font-semibold">{invite.game_lobbies.subject}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Mode</div>
                        <div className="font-semibold">
                          {invite.game_lobbies.game_mode === 'quiz' ? '🏆 Quiz' : '📚 Study'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Players</div>
                        <div className="font-semibold flex items-center justify-center">
                          <Users className="w-4 h-4 mr-1" />
                          {invite.game_lobbies.current_players}/{invite.game_lobbies.max_players}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <Badge variant={invite.game_lobbies.status === 'waiting' ? 'default' : 'secondary'}>
                          {invite.game_lobbies.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => respondToInvite(invite.id, 'accepted')}
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        disabled={invite.game_lobbies.status !== 'waiting'}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept & Join
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => respondToInvite(invite.id, 'rejected')}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>

                    {invite.game_lobbies.status !== 'waiting' && (
                      <p className="text-sm text-muted-foreground text-center">
                        This lobby is no longer accepting players
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinLobbyFlow;