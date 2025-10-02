import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import LobbyMenu from './LobbyMenu';
import CreateLobbyFlow from './CreateLobbyFlow';
import JoinLobbyFlow from './JoinLobbyFlow';
import LobbyWaitingRoom from './LobbyWaitingRoom';
import QuizSession from './QuizSession';

interface GameLobbyProps {
  onBack: () => void;
  initialView?: LobbyView;
}

type LobbyView = 'menu' | 'create' | 'join' | 'waiting' | 'quiz';

const GameLobby = ({ onBack, initialView }: GameLobbyProps) => {
  const [currentView, setCurrentView] = useState<LobbyView>(initialView || 'menu');
  const [currentLobby, setCurrentLobby] = useState<any>(null);
  const location = useLocation();

  console.log('GameLobby render - currentView:', currentView, 'currentLobby:', currentLobby);

  // Check if we should open join lobby from notification or dashboard
  useEffect(() => {
    const state = location.state as any;
    if (state?.openJoinLobby) {
      console.log('Opening join lobby from notification/state');
      setCurrentView('join');
    }
  }, [location]);

  useEffect(() => {
    console.log('GameLobby current view:', currentView);
    console.log('GameLobby current lobby:', currentLobby);
  }, [currentView, currentLobby]);

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
    console.log('=== LOBBY CREATED ===');
    console.log('Lobby created with status:', lobby.status);
    console.log('Full lobby data:', lobby);
    setCurrentLobby(lobby);
    if (lobby.status === 'active') {
      console.log('Switching to quiz view immediately');
      setCurrentView('quiz');
    } else {
      console.log('Switching to waiting view');
      setCurrentView('waiting');
    }
  };

  const handleJoinedLobby = (lobby: any) => {
    console.log('=== LOBBY JOINED ===');
    console.log('Joined lobby with status:', lobby.status);
    console.log('Full lobby data:', lobby);
    setCurrentLobby(lobby);
    if (lobby.status === 'active') {
      console.log('Switching to quiz view immediately');
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
      console.log('=== RENDERING QUIZ SESSION ===');
      console.log('Current lobby for quiz:', currentLobby);
      if (!currentLobby) {
        console.error('NO LOBBY DATA FOR QUIZ!');
        return (
          <div className="pt-20 pb-12">
            <div className="container mx-auto px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>No lobby data available. Please go back and try again.</p>
                  <Button onClick={handleBackToMenu} className="mt-4">Back to Menu</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }
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