import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReportUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
}

const ReportUserDialog: React.FC<ReportUserDialogProps> = ({
  open,
  onOpenChange,
  userId,
  username
}) => {
  const [reason, setReason] = useState<'inappropriate' | 'spam' | 'harassment' | 'other' | ''>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Please select a reason',
        description: 'You must select a reason for reporting this user.',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to report users.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: userId,
          reason,
          details: details.trim() || null
        });

      if (error) throw error;

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep StudyMates safe. Our team will review your report.'
      });

      onOpenChange(false);
      setReason('');
      setDetails('');
    } catch (error) {
      console.error('Error reporting user:', error);
      toast({
        title: 'Failed to submit report',
        description: 'There was an error submitting your report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Report @{username}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Reason for reporting:</Label>
            <RadioGroup value={reason} onValueChange={(value) => setReason(value as any)} className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" id="inappropriate" />
                <Label htmlFor="inappropriate" className="text-sm font-normal cursor-pointer">
                  Inappropriate behavior
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" />
                <Label htmlFor="spam" className="text-sm font-normal cursor-pointer">
                  Spam
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harassment" id="harassment" />
                <Label htmlFor="harassment" className="text-sm font-normal cursor-pointer">
                  Harassment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="text-sm font-normal cursor-pointer">
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="details" className="text-sm font-medium">
              Additional details (optional):
            </Label>
            <Textarea
              id="details"
              placeholder="Provide more information about the issue..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportUserDialog;
