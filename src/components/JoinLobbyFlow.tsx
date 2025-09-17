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

    console.log('Loading invites for user:', user.id);
    
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

      console.log('Lobby invites query result:', { data, error });

      if (error) throw error;

      // Get sender profiles separately
      const senderIds = data?.map(invite => invite.sender_id) || [];
      console.log('Sender IDs:', senderIds);
      
      const { data: profiles } = await supabase
        .from('profile_view')
        .select('user_id, username')
        .in('user_id', senderIds);

      console.log('Profiles query result:', profiles);

      // Transform the data to match our interface
      const transformedInvites = data?.map((invite: any) => ({
        ...invite,
        sender_profile: profiles?.find(p => p.user_id === invite.sender_id) || { username: 'Unknown' },
      })) || [];

      console.log('Transformed invites:', transformedInvites);
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

  const handleInviteClick = async (invite: LobbyInvite) => {
    console.log('Invite clicked:', invite);
    
    try {
      // First check if lobby is still valid
      console.log('Checking lobby validity for lobby_id:', invite.lobby_id);
      
      const { data: currentLobby, error: lobbyError } = await supabase
        .from('game_lobbies')
        .select('*')
        .eq('id', invite.lobby_id)
        .single();

      console.log('Current lobby check result:', { currentLobby, lobbyError });

      if (lobbyError || !currentLobby) {
        console.log('Lobby not found or error occurred');
        toast({
          title: 'Lobby No Longer Available',
          description: 'This lobby is no longer available.',
          variant: 'destructive'
        });
        // Remove the invalid invite from the list
        setInvites(prevInvites => prevInvites.filter(inv => inv.id !== invite.id));
        return;
      }

      // Check if lobby is full
      console.log('Checking if lobby is full. Current:', currentLobby.current_players, 'Max:', currentLobby.max_players);
      if (currentLobby.current_players >= currentLobby.max_players) {
        console.log('Lobby is full');
        toast({
          title: 'Lobby Full',
          description: 'This lobby is now full.',
          variant: 'destructive'
        });
        return;
      }

      // Check if lobby is not waiting
      console.log('Lobby status:', currentLobby.status);
      if (currentLobby.status !== 'waiting' && currentLobby.status !== 'in_progress') {
        console.log('Lobby is not waiting for players');
        toast({
          title: 'Lobby No Longer Available',
          description: 'This lobby is no longer accepting players.',
          variant: 'destructive'
        });
        return;
      }

      // Get user profile to join lobby
      console.log('Getting user profile for user_id:', user?.id);
      const { data: profile, error: profileError } = await supabase
        .from('profile_view')
        .select('username')
        .eq('user_id', user?.id)
        .single();

      console.log('Profile query result:', { profile, profileError });
      if (profileError) throw profileError;

      // Check if user is already in this lobby
      console.log('Checking if user already in lobby');
      const { data: existingParticipant, error: checkError } = await supabase
        .from('lobby_participants')
        .select('*')
        .eq('lobby_id', invite.lobby_id)
        .eq('user_id', user?.id)
        .single();

      console.log('Existing participant check:', { existingParticipant, checkError });
      
      if (existingParticipant) {
        console.log('User already in lobby, navigating directly');
        toast({
          title: 'Already in Lobby',
          description: 'You are already a participant in this lobby.',
        });
        
        // Navigate to the lobby
        onJoinLobby({
          id: invite.lobby_id,
          ...currentLobby
        });
        return;
      }

      // Find next available slot
      console.log('Finding next available slot');
      const { data: participants, error: participantsError } = await supabase
        .from('lobby_participants')
        .select('slot_number')
        .eq('lobby_id', invite.lobby_id)
        .order('slot_number');

      console.log('Participants query result:', { participants, participantsError });
      if (participantsError) throw participantsError;

      const occupiedSlots = participants?.map(p => p.slot_number) || [];
      let nextSlot = 1;
      for (let i = 1; i <= currentLobby.max_players; i++) {
        if (!occupiedSlots.includes(i)) {
          nextSlot = i;
          break;
        }
      }
      console.log('Next available slot:', nextSlot, 'Occupied slots:', occupiedSlots);

      // Join the lobby
      console.log('Joining lobby with data:', {
        lobby_id: invite.lobby_id,
        user_id: user?.id,
        username: profile.username,
        slot_number: nextSlot
      });
      
      const { error: joinError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: invite.lobby_id,
          user_id: user?.id,
          username: profile.username,
          slot_number: nextSlot
        });

      console.log('Join lobby result:', { joinError });
      if (joinError) throw joinError;

      // Update lobby current players count
      console.log('Updating lobby current players count');
      const { error: lobbyUpdateError } = await supabase
        .from('game_lobbies')
        .update({ 
          current_players: currentLobby.current_players + 1 
        })
        .eq('id', invite.lobby_id);

      console.log('Lobby update result:', { lobbyUpdateError });
      if (lobbyUpdateError) throw lobbyUpdateError;

      // Update invite status
      console.log('Updating invite status to accepted');
      const { error: updateError } = await supabase
        .from('lobby_invites')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', invite.id);

      console.log('Invite update result:', { updateError });
      if (updateError) throw updateError;

      toast({
        title: 'Joined Lobby!',
        description: `You've joined ${invite.sender_profile.username}'s lobby.`,
      });

      console.log('Navigating to lobby:', {
        id: invite.lobby_id,
        ...currentLobby
      });

      // Navigate to the lobby
      onJoinLobby({
        id: invite.lobby_id,
        ...currentLobby
      });

    } catch (error) {
      console.error('Error joining lobby:', error);
      toast({
        title: 'Error',
        description: 'Failed to join lobby.',
        variant: 'destructive'
      });
    }
  };

  const rejectInvite = async (inviteId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('lobby_invites')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      toast({
        title: 'Invite Rejected',
        description: 'You have declined the lobby invitation.',
      });

      // Remove the invite from the list
      setInvites(prevInvites => prevInvites.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error('Error rejecting invite:', error);
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
              <Card 
                key={invite.id} 
                className="bg-gradient-card border-primary/20 cursor-pointer hover:bg-gradient-card-hover transition-colors"
                onClick={() => handleInviteClick(invite)}
              >
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
                        <Badge variant={invite.game_lobbies.status === 'waiting' ? 'default' : invite.game_lobbies.status === 'in_progress' ? 'secondary' : 'secondary'}>
                          {invite.game_lobbies.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInviteClick(invite);
                        }}
                        className="flex-1 bg-gradient-primary hover:opacity-90"
                        disabled={invite.game_lobbies.status !== 'waiting' && invite.game_lobbies.status !== 'in_progress'}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept & Join
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          rejectInvite(invite.id);
                        }}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>

                    {invite.game_lobbies.status !== 'waiting' && invite.game_lobbies.status !== 'in_progress' && (
                      <p className="text-sm text-muted-foreground text-center">
                        This lobby is no longer accepting players
                      </p>
                    )}

                    <p className="text-sm text-center text-muted-foreground">
                      Click anywhere on this card to join the lobby
                    </p>
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