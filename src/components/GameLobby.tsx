import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LobbyMenu from './LobbyMenu';
import CreateLobbyFlow from './CreateLobbyFlow';
import JoinLobbyFlow from './JoinLobbyFlow';

interface GameLobbyProps {
  onBack: () => void;
}

type LobbyView = 'menu' | 'create' | 'join' | 'inLobby';

const GameLobby = ({ onBack }: GameLobbyProps) => {
  const [currentView, setCurrentView] = useState<LobbyView>('menu');
  const [currentLobby, setCurrentLobby] = useState<any>(null);

  const handleCreateLobby = () => {
    setCurrentView('create');
  };

  const handleJoinLobby = () => {
    setCurrentView('join');
  };

  const handleBackToMenu = () => {
    if (currentView === 'menu') {
      onBack();
    } else {
      setCurrentView('menu');
      setCurrentLobby(null);
    }
  };

  const handleLobbyCreated = (lobby: any) => {
    setCurrentLobby(lobby);
    setCurrentView('inLobby');
  };

  const handleJoinedLobby = (lobby: any) => {
    setCurrentLobby(lobby);
    setCurrentView('inLobby');
  };

  // Render based on current view
  switch (currentView) {
    case 'create':
      return (
        <CreateLobbyFlow
          onBack={handleBackToMenu}
          onLobbyCreated={handleLobbyCreated}
        />
      );
    case 'join':
      return (
        <JoinLobbyFlow
          onBack={handleBackToMenu}
          onJoinLobby={handleJoinedLobby}
        />
      );
    case 'inLobby':
      // TODO: Create a dedicated InLobbyView component
      return (
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">In Lobby: {currentLobby?.subject}</h2>
            <p className="text-muted-foreground mb-4">Lobby functionality will be implemented here</p>
            <Button onClick={handleBackToMenu}>Back to Menu</Button>
          </div>
        </div>
      );
    default:
      return (
        <LobbyMenu
          onBack={onBack}
          onCreateLobby={handleCreateLobby}
          onJoinLobby={handleJoinLobby}
        />
      );
  }
};

export default GameLobby;