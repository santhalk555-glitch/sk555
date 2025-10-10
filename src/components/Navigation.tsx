import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "@/components/NotificationBell";
import studymatesLogo from "@/assets/studymates-logo-new.jpg";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src={studymatesLogo} 
              alt="StudyMates Logo - Connect with Study Partners" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-xl font-bold text-primary tracking-tight">
              StudyMates
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <Button 
              variant="gaming" 
              size="sm" 
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