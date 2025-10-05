import { Button } from "@/components/ui/button";
import { Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/NotificationBell";
import studymatesLogo from "@/assets/studymates-logo.jpeg";

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
            <img 
              src={studymatesLogo} 
              alt="StudyMates Logo" 
              className="w-10 h-10 rounded-lg object-cover"
            />
            <h1 className="text-xl font-bold text-[#FF1493]">
              StudyMates Arena
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationBell />
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