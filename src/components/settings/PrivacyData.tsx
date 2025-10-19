import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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
    if (!user) {
      console.error('[DELETE_ACCOUNT] No user found');
      return;
    }

    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type DELETE to confirm account deletion.',
        variant: 'destructive'
      });
      return;
    }
    
    console.log('[DELETE_ACCOUNT] Starting account deletion process for user:', user.id);
    setIsDeleting(true);
    
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('[DELETE_ACCOUNT] No active session found');
        throw new Error('No active session. Please log in again.');
      }

      console.log('[DELETE_ACCOUNT] Session found, calling delete-user-account function');
      
      // Call edge function to schedule account deletion (30-day grace period)
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        method: 'POST'
      });

      console.log('[DELETE_ACCOUNT] Function response:', { data, error });

      if (error) {
        console.error('[DELETE_ACCOUNT] Function returned error:', {
          message: error.message,
          context: error.context,
          status: error.status
        });
        
        // Parse error message for better user feedback
        let errorMessage = 'Something went wrong. Please try again later.';
        
        if (error.message?.includes('token') || error.message?.includes('expired')) {
          errorMessage = 'Your session has expired. Please log in again and try deleting your account.';
        } else if (error.message?.includes('authorization')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.context?.details) {
          errorMessage = `Error: ${error.context.details}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log('[DELETE_ACCOUNT] Account deletion scheduled successfully');
      
      // Format deletion date
      const deletionDate = new Date(data.deletion_expires_at);
      const formattedDate = deletionDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      toast({
        title: 'Account Deactivated',
        description: `Your account is scheduled for deletion on ${formattedDate}. If you log in before then, deletion will be cancelled.`,
        duration: 10000,
      });
      
      // Close dialog and reset state
      setDialogOpen(false);
      setDeleteConfirmation('');
      
      // Sign out and redirect after a brief delay
      setTimeout(async () => {
        console.log('[DELETE_ACCOUNT] Signing out and redirecting');
        await supabase.auth.signOut({ scope: 'global' });
        navigate('/auth');
      }, 2000);
      
    } catch (error: any) {
      console.error('[DELETE_ACCOUNT] Error during deletion:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again later.',
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
          
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Schedule Account Deletion?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p className="text-destructive font-semibold">
                    ⚠️ 30-Day Grace Period
                  </p>
                  <p>
                    Deleting your account will deactivate it immediately. Your data will be permanently deleted after 30 days.</p>
                  <p className="text-sm font-medium">
                    You can cancel deletion anytime by logging in again before the 30-day deadline.
                  </p>
                  <p>
                    All your data will be removed including:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Profile information</li>
                    <li>Friends and connections</li>
                    <li>Messages and chat history</li>
                    <li>Quiz history and scores</li>
                    <li>All saved data</li>
                  </ul>
                  <div className="pt-2">
                    <Label htmlFor="delete-confirm" className="text-sm font-medium">
                      Type <span className="font-bold text-destructive">DELETE</span> to confirm:
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE"
                      className="mt-2"
                      disabled={isDeleting}
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmation('')}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
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