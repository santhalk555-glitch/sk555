import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import LobbyMenu from './LobbyMenu';
import CreateLobbyFlow from './CreateLobbyFlow';
import JoinLobbyFlow from './JoinLobbyFlow';
import LobbyWaitingRoom from './LobbyWaitingRoom';
import QuizSession from './QuizSession';

interface GameLobbyProps {
  onBack: () => void;
}

type LobbyView = 'menu' | 'create' | 'join' | 'waiting' | 'quiz';

const GameLobby = ({ onBack }: GameLobbyProps) => {
  const [currentView, setCurrentView] = useState<LobbyView>('menu');
  const [currentLobby, setCurrentLobby] = useState<any>(null);
  const location = useLocation();

  // Check if we should open join lobby from notification
  useEffect(() => {
    const state = location.state as any;
    if (state?.openJoinLobby) {
      setCurrentView('join');
    }
  }, [location]);

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
    console.log('Lobby created with status:', lobby.status);
    setCurrentLobby(lobby);
    if (lobby.status === 'active') {
      console.log('Switching to quiz view');
      setCurrentView('quiz');
    } else {
      console.log('Switching to waiting view');
      setCurrentView('waiting');
    }
  };

  const handleJoinedLobby = (lobby: any) => {
    console.log('Joined lobby with status:', lobby.status);
    setCurrentLobby(lobby);
    if (lobby.status === 'active') {
      console.log('Switching to quiz view');
      setCurrentView('quiz');
    } else {
      console.log('Switching to waiting view');
      setCurrentView('waiting');
    }
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
    case 'waiting':
      return (
        <LobbyWaitingRoom
          lobby={currentLobby}
          onBack={handleBackToMenu}
          onQuizStarted={(lobby) => {
            console.log('Quiz started callback received, lobby status:', lobby.status);
            setCurrentLobby(lobby);
            setCurrentView('quiz');
          }}
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