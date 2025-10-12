import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Unlock, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface BannedUser {
  id: string;
  banned_user_id: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
}

const BanList: React.FC = () => {
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unbanningUserId, setUnbanningUserId] = useState<string | null>(null);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BannedUser | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadBannedUsers();
  }, [user]);

  const loadBannedUsers = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('banned_users')
        .select(`
          id,
          banned_user_id,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for banned users
      if (data && data.length > 0) {
        const userIds = data.map(ban => ban.banned_user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const bannedUsersWithProfiles = data.map(ban => {
          const profile = profiles?.find(p => p.user_id === ban.banned_user_id);
          return {
            ...ban,
            profile: {
              username: profile?.username || 'Unknown User',
              avatar_url: profile?.avatar_url || null
            }
          };
        });

        setBannedUsers(bannedUsersWithProfiles);
      } else {
        setBannedUsers([]);
      }
    } catch (error) {
      console.error('Error loading banned users:', error);
      toast({
        title: 'Error loading ban list',
        description: 'Could not load your banned users.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanClick = (bannedUser: BannedUser) => {
    setSelectedUser(bannedUser);
    setShowUnbanDialog(true);
  };

  const handleUnban = async () => {
    if (!selectedUser) return;

    setUnbanningUserId(selectedUser.banned_user_id);

    try {
      const { error } = await supabase
        .from('banned_users')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: 'User unbanned',
        description: `@${selectedUser.profile.username} has been removed from your ban list.`
      });

      setBannedUsers(bannedUsers.filter(u => u.id !== selectedUser.id));
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: 'Failed to unban user',
        description: 'There was an error. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUnbanningUserId(null);
      setShowUnbanDialog(false);
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Ban List
          </CardTitle>
          <CardDescription>Manage users you've banned</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Ban List
          </CardTitle>
          <CardDescription>Manage users you've banned</CardDescription>
        </CardHeader>
        <CardContent>
          {bannedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't banned any users.</p>
          ) : (
            <div className="space-y-3">
              {bannedUsers.map((bannedUser) => (
                <div
                  key={bannedUser.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={bannedUser.profile.avatar_url || undefined} />
                      <AvatarFallback>
                        {bannedUser.profile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">@{bannedUser.profile.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Banned on {new Date(bannedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnbanClick(bannedUser)}
                    disabled={unbanningUserId === bannedUser.banned_user_id}
                  >
                    <Unlock className="w-4 h-4 mr-1" />
                    {unbanningUserId === bannedUser.banned_user_id ? 'Unbanning...' : 'Unban'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban <span className="font-semibold">@{selectedUser?.profile.username}</span>? 
              They will be able to interact with you again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnban}>
              Confirm Unban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BanList;
