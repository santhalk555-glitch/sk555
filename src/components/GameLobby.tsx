import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LobbyMenu from './LobbyMenu';
import CreateLobbyFlow from './CreateLobbyFlow';
import JoinLobbyFlow from './JoinLobbyFlow';

interface GameLobbyProps {
  onBack: () => void;
}

type LobbyView = 'menu' | 'create' | 'join';

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
    // Stay in create view - CreateLobbyFlow handles lobby display
  };

  const handleJoinedLobby = (lobby: any) => {
    setCurrentLobby(lobby);
    setCurrentView('join');
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