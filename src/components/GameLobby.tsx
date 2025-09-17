import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LobbyMenu from './LobbyMenu';
import CreateLobbyFlow from './CreateLobbyFlow';
import JoinLobbyFlow from './JoinLobbyFlow';
import QuizSession from './QuizSession';

interface GameLobbyProps {
  onBack: () => void;
}

type LobbyView = 'menu' | 'create' | 'join' | 'quiz';

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
    if (lobby.status === 'in_progress') {
      setCurrentView('quiz');
    }
    // Stay in create view - CreateLobbyFlow handles lobby display
  };

  const handleJoinedLobby = (lobby: any) => {
    setCurrentLobby(lobby);
    if (lobby.status === 'in_progress') {
      setCurrentView('quiz');
    } else {
      setCurrentView('join');
    }
  };

  // Render based on current view
  switch (currentView) {
    case 'create':
      return (
        <CreateLobbyFlow
          onBack={handleBackToMenu}
          onLobbyCreated={handleLobbyCreated}
          onQuizStarted={(lobby) => {
            setCurrentLobby(lobby);
            setCurrentView('quiz');
          }}
        />
      );
    case 'join':
      return (
        <JoinLobbyFlow
          onBack={handleBackToMenu}
          onJoinLobby={handleJoinedLobby}
        />
      );
    case 'quiz':
      return (
        <QuizSession
          lobby={currentLobby}
          onBack={handleBackToMenu}
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