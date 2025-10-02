import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Users, Plus, UserPlus, Crown, Play, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, parseCompetitiveExams } from '@/types/profile';

interface LobbyWaitingRoomProps {
  lobby: any;
  onBack: () => void;
  onQuizStarted: (lobby: any) => void;
}

interface LobbyParticipant {
  slot_number: number;
  username: string;
  user_id: string;
  ready: boolean;
}

const LobbyWaitingRoom = ({ lobby: initialLobby, onBack, onQuizStarted }: LobbyWaitingRoomProps) => {
  const [lobby, setLobby] = useState(initialLobby);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [hasShownStartToast, setHasShownStartToast] = useState(false);
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

      // Set up multiple real-time channels to ensure delivery
      const lobbyChannel1 = supabase
        .channel(`lobby-main-${lobby.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'game_lobbies',
            filter: `id=eq.${lobby.id}`
          },
          (payload) => {
            console.log('Lobby updated via real-time MAIN channel for user:', user?.id, payload);
            const updatedLobby = payload.new;
            setLobby(updatedLobby);
            
            // If quiz started, redirect all participants immediately
            if (updatedLobby.status === 'active') {
              console.log('Quiz status changed to active via real-time MAIN, starting quiz for participant:', user?.id);
              onQuizStarted(updatedLobby);
            }
          }
        )
        .subscribe();

      // Second backup channel with user-specific name
      const lobbyChannel2 = supabase
        .channel(`lobby-backup-${lobby.id}-${user?.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'game_lobbies',
            filter: `id=eq.${lobby.id}`
          },
          (payload) => {
            console.log('Lobby updated via real-time BACKUP channel for user:', user?.id, payload);
            const updatedLobby = payload.new;
            setLobby(updatedLobby);
            
            // If quiz started, redirect all participants immediately
            if (updatedLobby.status === 'active') {
              console.log('Quiz status changed to active via real-time BACKUP, starting quiz for participant:', user?.id);
              onQuizStarted(updatedLobby);
            }
          }
        )
        .subscribe();

      // Very aggressive polling mechanism - check every 250ms
      const pollLobbyStatus = setInterval(async () => {
        try {
          const { data: currentLobby, error } = await supabase
            .from('game_lobbies')
            .select('*')
            .eq('id', lobby.id)
            .single();

          if (error) {
            console.error('Error polling lobby status for user:', user?.id, error);
            return;
          }

          if (currentLobby) {
            console.log('Polling lobby status for user:', user?.id, '- Current:', lobby.status, 'Database:', currentLobby.status);
            
            if (currentLobby.status !== lobby.status) {
              console.log('Lobby status changed via polling for user:', user?.id, '- New status:', currentLobby.status);
              setLobby(currentLobby);
              
              if (currentLobby.status === 'active') {
                console.log('Quiz started via polling, redirecting participant:', user?.id);
                clearInterval(pollLobbyStatus); // Stop polling once quiz starts
                onQuizStarted(currentLobby);
              }
            }
          }
        } catch (error) {
          console.error('Error polling lobby status for user:', user?.id, error);
        }
      }, 250); // Poll every 250ms for extremely fast response

      return () => {
        console.log('Cleaning up subscriptions for user:', user?.id);
        supabase.removeChannel(participantsChannel);
        supabase.removeChannel(lobbyChannel1);
        supabase.removeChannel(lobbyChannel2);
        clearInterval(pollLobbyStatus);
      };
    }
  }, [lobby, onQuizStarted, user?.id]);

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
        
        // Check if all players are ready - prevent multiple calls with loading check
        const allReady = data.length >= 2 && data.every((p: LobbyParticipant) => p.ready);
        if (allReady && isCreator && lobby.status === 'waiting' && !loading) {
          console.log('All players ready! Auto-starting quiz...');
          startQuiz();
        }
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const toggleReady = async () => {
    if (!user) return;

    const currentParticipant = participants.find(p => p.user_id === user.id);
    const newReadyStatus = !currentParticipant?.ready;

    try {
      const { error } = await supabase
        .from('lobby_participants')
        .update({ ready: newReadyStatus })
        .eq('lobby_id', lobby.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: newReadyStatus ? 'Ready!' : 'Not Ready',
        description: newReadyStatus ? 'Waiting for other players...' : 'Click Ready when you\'re prepared',
      });
    } catch (error) {
      console.error('Error updating ready status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ready status',
        variant: 'destructive'
      });
    }
  };

  const startQuiz = async () => {
    if (!lobby || !user || !isCreator || loading) return;

    console.log('Starting quiz for lobby:', lobby.id, 'with', participants.length, 'participants');
    setLoading(true);

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
      console.log('Calling start_quiz_lobby RPC function...');
      const { data, error } = await supabase.rpc('start_quiz_lobby', {
        lobby_id: lobby.id
      });

      console.log('start_quiz_lobby response:', { data, error });

      if (error) throw error;

      if (data) {
        console.log('Quiz started successfully!');
        
        // Update local lobby state immediately to prevent re-triggering
        setLobby(prev => prev ? { ...prev, status: 'active' } : null);
        
        // Only show toast once
        if (!hasShownStartToast) {
          setHasShownStartToast(true);
          toast({
            title: 'Quiz Started!',
            description: `The quiz has begun for all participants!`,
          });
        }
        
        // Don't immediately start for creator - let real-time handle it
        // This ensures all participants get synchronized start
        console.log('Quiz status updated, waiting for real-time notification...');
      } else {
        console.log('Quiz start failed - access denied');
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
        description: `Failed to start quiz: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!user) return;
    setLoadingFriends(true);

    try {
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) throw error;

      const friendProfiles: Profile[] = [];
      
      for (const friendship of friendships || []) {
        const otherUserId = friendship.user1_id === user.id ? friendship.user2_id : friendship.user1_id;
        
        const { data: profile, error: profileError } = await supabase
          .from('profile_view')
          .select('*')
          .eq('user_id', otherUserId)
          .single();
          
        if (profile && !profileError) {
          const parsedProfile = {
            ...profile,
            competitive_exams: parseCompetitiveExams(profile.competitive_exams)
          };
          friendProfiles.push(parsedProfile);
        }
      }

      setFriends(friendProfiles);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const inviteFriend = async (friendUserId: string, friendUsername: string) => {
    if (!lobby || !isCreator) return;

    try {
      if (participants.length >= lobby.max_players) {
        toast({
          title: 'Lobby Full',
          description: 'This lobby is already full.',
          variant: 'destructive'
        });
        return;
      }

      // Check if already invited
      const { data: existingInvite } = await supabase
        .from('lobby_invites')
        .select('*')
        .eq('lobby_id', lobby.id)
        .eq('receiver_id', friendUserId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvite) {
        toast({
          title: 'Already Invited',
          description: `@${friendUsername} has already been invited.`,
        });
        return;
      }

      const { error: inviteError } = await supabase
        .from('lobby_invites')
        .insert({
          lobby_id: lobby.id,
          sender_id: user?.id,
          receiver_id: friendUserId
        });

      if (inviteError) throw inviteError;

      toast({
        title: 'Invite Sent!',
        description: `Sent lobby invite to @${friendUsername}`,
      });
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invite.',
        variant: 'destructive'
      });
    }
  };

  const invitePlayer = async () => {
    if (!lobby || !inviteUserId.trim() || !isCreator) return;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profile_view')
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

      if (participants.length >= lobby.max_players) {
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
          lobby_id: lobby.id,
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
                Mode: {(lobby.lobby_type || lobby.game_mode) === 'quiz' ? '🏆 Quiz Mode' : '📚 Study Mode'}
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
                          <div className="flex gap-1 mt-1">
                            {participant.user_id === lobby.creator_id && (
                              <Badge variant="secondary">Creator</Badge>
                            )}
                            {participant.user_id === user?.id && participant.user_id !== lobby.creator_id && (
                              <Badge variant="outline">You</Badge>
                            )}
                            {participant.ready ? (
                              <Badge className="bg-green-500">✓ Ready</Badge>
                            ) : (
                              <Badge variant="outline" className="opacity-50">Not Ready</Badge>
                            )}
                          </div>
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

        {/* Ready Button for All Players - Visible to Everyone */}
        {lobby.status === 'waiting' && participants.some(p => p.user_id === user?.id) && (
          <Card className="mb-8 border-2 border-primary/30 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-xl">
                <CheckCircle className="w-5 h-5 mr-2" />
                Player Ready Check
              </CardTitle>
              <CardDescription className="text-center">
                Click the button below when you're ready to start
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={toggleReady}
                className={`w-full py-6 text-lg font-bold transition-all ${
                  participants.find(p => p.user_id === user?.id)?.ready
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gradient-primary hover:opacity-90'
                }`}
                size="lg"
              >
                {participants.find(p => p.user_id === user?.id)?.ready ? (
                  <>
                    <CheckCircle className="w-6 h-6 mr-2" />
                    ✓ Ready!
                  </>
                ) : (
                  'Click When Ready'
                )}
              </Button>
              <div className="text-center text-sm mt-4 space-y-1">
                <p className="font-semibold text-primary">
                  {participants.filter(p => p.ready).length}/{participants.length} players ready
                </p>
                {participants.length >= 2 && participants.every(p => p.ready) && isCreator && (
                  <p className="text-green-500 font-bold animate-pulse">🎮 Starting quiz...</p>
                )}
                {participants.length >= 2 && !participants.every(p => p.ready) && (
                  <p className="text-muted-foreground">Waiting for all players to be ready...</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
                    Invite your friends to join this lobby
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => {
                        setShowInviteDialog(true);
                        loadFriends();
                      }}
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Invite Friends
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter username..."
                        value={inviteUserId}
                        onChange={(e) => setInviteUserId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            invitePlayer();
                          }
                        }}
                        maxLength={20}
                      />
                      <Button 
                        onClick={invitePlayer}
                        disabled={!inviteUserId.trim()}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>• {lobby.max_players - participants.length} slots remaining</p>
                      <p>• Players will receive an invitation notification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz/Practice Controls - Hidden when ready system is active */}
            {lobby.status === 'waiting' && participants.length < 2 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-primary" />
                    {(lobby.lobby_type || lobby.game_mode) === 'quiz' ? 'Quiz Controls' : 'Practice Controls'}
                  </CardTitle>
                  <CardDescription>
                    {(lobby.lobby_type || lobby.game_mode) === 'quiz' 
                      ? 'Waiting for more players... (Quiz starts when all are ready)'
                      : 'Start your practice session'}
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
                        {(lobby.lobby_type || lobby.game_mode) === 'quiz' ? 'Start Quiz' : 'Start Practice'}
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-center">
                      {(lobby.lobby_type || lobby.game_mode) === 'practice' ? (
                        <p>📚 Practice Mode - Learn at your own pace!</p>
                      ) : participants.length === 1 ? (
                        <p>🎯 Waiting for at least 2 players...</p>
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
                  The lobby creator will start the {(lobby.lobby_type || lobby.game_mode) === 'quiz' ? 'quiz' : 'study session'} when ready.
                </p>
                {(lobby.lobby_type || lobby.game_mode) === 'quiz' && (
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

        {/* Invite Friends Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Friends to Lobby</DialogTitle>
              <DialogDescription>
                Select friends to invite to your quiz lobby
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loadingFriends ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No friends yet. Go to matching to find study partners!</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.user_id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {friend.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">@{friend.username}</div>
                        <div className="text-xs text-muted-foreground">{friend.course_name}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => inviteFriend(friend.user_id, friend.username || '')}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LobbyWaitingRoom;