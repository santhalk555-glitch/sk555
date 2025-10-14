import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import BanList from '@/components/BanList';
import SecuritySettings from '@/components/settings/SecuritySettings';
import AppPreferences from '@/components/settings/AppPreferences';
import PrivacyData from '@/components/settings/PrivacyData';

const AccountSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto pt-20">
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

        {/* Tabs Layout */}
        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card shadow-sm">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
            <TabsTrigger value="banned">Ban List</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <AppPreferences />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <PrivacyData />
          </TabsContent>

          <TabsContent value="banned" className="space-y-6">
            <BanList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings;