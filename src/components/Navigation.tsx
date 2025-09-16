import { Button } from "@/components/ui/button";
import { Users, Gamepad2, Trophy, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StudyMates
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/profile-matches')}
            >
              <Users className="w-4 h-4 mr-2" />
              Find Partners
            </Button>
            <Button 
              variant="gaming" 
              size="sm" 
              className="ml-4"
              onClick={() => navigate('/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;