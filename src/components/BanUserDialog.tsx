import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  onBanComplete?: () => void;
}

const BanUserDialog: React.FC<BanUserDialogProps> = ({
  open,
  onOpenChange,
  userId,
  username,
  onBanComplete
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleBan = async () => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to ban users.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('banned_users')
        .insert({
          user_id: user.id,
          banned_user_id: userId
        });

      if (error) throw error;

      toast({
        title: 'User banned',
        description: `You won't see @${username}'s profile, messages, or study requests anymore.`
      });

      onOpenChange(false);
      onBanComplete?.();
    } catch (error: any) {
      console.error('Error banning user:', error);
      
      if (error.code === '23505') {
        toast({
          title: 'Already banned',
          description: 'This user is already in your ban list.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Failed to ban user',
          description: 'There was an error. Please try again.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="w-5 h-5" />
            Ban User
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to ban <span className="font-semibold">@{username}</span>? 
          </p>
          <p className="text-sm text-muted-foreground">
            You won't see their profile, messages, or study requests again.
          </p>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBan} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Banning...' : 'Confirm Ban'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BanUserDialog;
