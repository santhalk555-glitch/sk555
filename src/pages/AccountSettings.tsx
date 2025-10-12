import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BanList from '@/components/BanList';

const AccountSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Account Settings
        </h1>

        <div className="space-y-6">
          <BanList />
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
