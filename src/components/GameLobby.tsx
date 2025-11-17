import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import LobbyMenu from './LobbyMenu';
import CreateLobbyFlow from './CreateLobbyFlow';
import JoinLobbyFlow from './JoinLobbyFlow';
import LobbyWaitingRoom from './LobbyWaitingRoom';
import QuizSession from './QuizSession';
import PracticeLobby from './PracticeLobby';

interface GameLobbyProps {
  onBack: () => void;
  initialView?: LobbyView;
}

type LobbyView = 'menu' | 'create' | 'join' | 'waiting' | 'quiz';

const GameLobby = ({ onBack, initialView }: GameLobbyProps) => {
  const [currentView, setCurrentView] = useState<LobbyView>(initialView || 'menu');
  const [currentLobby, setCurrentLobby] = useState<any>(null);
  const [showPracticeLobby, setShowPracticeLobby] = useState(false);
  const location = useLocation();

  console.log('GameLobby render - currentView:', currentView, 'currentLobby:', currentLobby);

  // Handle browser back button for internal lobby navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.lobbyView) {
        setCurrentView(event.state.lobbyView);
        if (event.state.lobbyView === 'menu') {
          setCurrentLobby(null);
          setShowPracticeLobby(false);
        }
      } else if (event.state?.section === 'dashboard') {
        // Going back to dashboard
        onBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initialize with current view
    if (!window.history.state?.lobbyView) {
      window.history.replaceState({ section: 'lobby', lobbyView: currentView }, '', window.location.pathname);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [onBack, currentView]);

  // Check if we should open join lobby from notification or dashboard
  useEffect(() => {
    const state = location.state as any;
    if (state?.openJoinLobby) {
      console.log('Opening join lobby from notification/state');
      navigateToView('join');
    }
  }, [location]);

  // Helper function to navigate to a view with history management
  const navigateToView = (view: LobbyView) => {
    setCurrentView(view);
    window.history.pushState({ section: 'lobby', lobbyView: view }, '', window.location.pathname);
  };

  useEffect(() => {
    console.log('GameLobby current view:', currentView);
    console.log('GameLobby current lobby:', currentLobby);
  }, [currentView, currentLobby]);

  const handleCreateLobby = () => {
    navigateToView('create');
  };

  const handleJoinLobby = () => {
    navigateToView('join');
  };

  const handlePracticeLobby = () => {
    setShowPracticeLobby(true);
    window.history.replaceState({ section: 'lobby', lobbyView: 'practice' }, '', window.location.pathname);
  };

  const handleBackToMenu = () => {
    if (currentView === 'menu' && !showPracticeLobby) {
      // Going back from main menu - go to dashboard
      window.history.back();
    } else {
      navigateToView('menu');
      setCurrentLobby(null);
      setShowPracticeLobby(false);
    }
  };

  const handleLobbyCreated = (lobby: any) => {
    console.log('=== LOBBY CREATED ===');
    console.log('Lobby created with status:', lobby.status);
    console.log('Full lobby data:', lobby);
    setCurrentLobby(lobby);
    if (lobby.status === 'active') {
      console.log('Switching to quiz view immediately');
      navigateToView('quiz');
    } else {
      console.log('Switching to waiting view');
      navigateToView('waiting');
    }
  };

  const handleJoinedLobby = (lobby: any) => {
    console.log('=== LOBBY JOINED ===');
    console.log('Joined lobby with status:', lobby.status);
    console.log('Full lobby data:', lobby);
    setCurrentLobby(lobby);
    if (lobby.status === 'active') {
      console.log('Switching to quiz view immediately');
      navigateToView('quiz');
    } else {
      console.log('Switching to waiting view');
      navigateToView('waiting');
    }
  };

  // Show Practice Lobby if selected
  if (showPracticeLobby) {
    return <PracticeLobby onBack={() => {
      setShowPracticeLobby(false);
      window.history.back();
    }} />;
  }

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
          onPracticeLobby={handlePracticeLobby}
        />
      );
  }
};

export default GameLobby;