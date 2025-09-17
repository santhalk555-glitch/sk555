import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubjectSelectionModal from './SubjectSelectionModal';

interface CreateLobbyFlowProps {
  onBack: () => void;
  onLobbyCreated: (lobby: any) => void;
}

const CreateLobbyFlow = ({ onBack, onLobbyCreated }: CreateLobbyFlowProps) => {
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubjectSelect = (subject: string, maxPlayers: 2 | 4, gameMode: 'study' | 'quiz') => {
    setShowSubjectModal(false);
    createLobbyWithOptions(subject, maxPlayers, gameMode);
  };

  const createLobbyWithOptions = async (subject: string, maxPlayers: 2 | 4, gameMode: 'study' | 'quiz') => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profile_view')
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
              Choose your study mode and subject
            </p>
          </div>
          
          <div></div>
        </div>

        {/* Create Lobby Button */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Plus className="w-5 h-5 mr-2" />
              New Lobby
            </CardTitle>
            <CardDescription className="text-center">
              Create a study or quiz lobby and invite friends
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => setShowSubjectModal(true)}
              disabled={loading}
              className="bg-gradient-primary hover:opacity-90 min-w-[200px]"
              size="lg"
            >
              Choose Subject & Mode
            </Button>
          </CardContent>
        </Card>

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