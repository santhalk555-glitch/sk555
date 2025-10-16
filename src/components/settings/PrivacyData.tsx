import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Eye, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PrivacyData = () => {
  const [showInSearch, setShowInSearch] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [allowMessagesNonFriends, setAllowMessagesNonFriends] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('show_in_search, allow_friend_requests, allow_messages_non_friends')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading privacy settings:', error);
      } else if (data) {
        setShowInSearch(data.show_in_search ?? true);
        setAllowFriendRequests(data.allow_friend_requests ?? true);
        setAllowMessagesNonFriends(data.allow_messages_non_friends ?? true);
      }
      setLoading(false);
    };

    loadSettings();
  }, [user]);

  const updateSetting = async (field: string, value: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: t('error'),
        description: 'Failed to update setting.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('success'),
        description: t('settingUpdated')
      });
    }
  };

  const handleDownloadData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const dataStr = JSON.stringify(profileData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'studymates-data.json';
      link.click();

      toast({
        title: 'Success',
        description: 'Your data has been downloaded!'
      });
    } catch (error) {
      console.error('Error downloading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to download data.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Call edge function to delete the auth user (which will cascade delete all related data)
      const response = await fetch(
        `https://jczdjensbkzhsehgtvcq.supabase.co/functions/v1/delete-user-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast({
        title: t('success'),
        description: t('accountDeleted')
      });
      
      // Sign out and redirect
      await supabase.auth.signOut({ scope: 'global' });
      navigate('/auth');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: t('error'),
        description: t('deleteError'),
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading privacy settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see and interact with your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-in-search">Show in Public Search</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to find you when searching for study partners
              </p>
            </div>
            <Switch
              id="show-in-search"
              checked={showInSearch}
              onCheckedChange={(checked) => {
                setShowInSearch(checked);
                updateSetting('show_in_search', checked);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="friend-requests">Allow Friend Requests</Label>
              <p className="text-sm text-muted-foreground">
                Let other users send you friend requests
              </p>
            </div>
            <Switch
              id="friend-requests"
              checked={allowFriendRequests}
              onCheckedChange={(checked) => {
                setAllowFriendRequests(checked);
                updateSetting('allow_friend_requests', checked);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="non-friend-messages">Allow Messages from Non-Friends</Label>
              <p className="text-sm text-muted-foreground">
                Receive messages from users who aren't your friends
              </p>
            </div>
            <Switch
              id="non-friend-messages"
              checked={allowMessagesNonFriends}
              onCheckedChange={(checked) => {
                setAllowMessagesNonFriends(checked);
                updateSetting('allow_messages_non_friends', checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Download or delete your account data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDownloadData}
          >
            <Download className="w-4 h-4 mr-2" />
            Download My Data
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteWarning')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? t('deleting') : t('confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyData;