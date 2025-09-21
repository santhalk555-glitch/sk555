import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReportQuestionDialogProps {
  questionId: string;
  questionText: string;
}

const ReportQuestionDialog: React.FC<ReportQuestionDialogProps> = ({ questionId, questionText }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<'incorrect' | 'unclear' | 'inappropriate' | ''>('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Please select a reason',
        description: 'You must select a reason for reporting this question.',
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to report questions.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('question_reports')
        .insert({
          user_id: user.id,
          question_id: questionId,
          reason,
          additional_comments: comments.trim() || null
        });

      if (error) throw error;

      toast({
        title: 'Question reported',
        description: 'Thank you for your feedback. The question has been reported for admin review.'
      });

      setOpen(false);
      setReason('');
      setComments('');
    } catch (error) {
      console.error('Error reporting question:', error);
      toast({
        title: 'Failed to report question',
        description: 'There was an error submitting your report. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Flag className="w-3 h-3 mr-1" />
          Report Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Question</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
            <p className="font-medium mb-1">Question:</p>
            <p>{questionText}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Reason for reporting:</Label>
            <RadioGroup value={reason} onValueChange={(value) => setReason(value as any)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incorrect" id="incorrect" />
                <Label htmlFor="incorrect" className="text-sm">Incorrect answer or question</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unclear" id="unclear" />
                <Label htmlFor="unclear" className="text-sm">Question is unclear or ambiguous</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate" id="inappropriate" />
                <Label htmlFor="inappropriate" className="text-sm">Inappropriate content</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="comments" className="text-sm font-medium">Additional comments (optional):</Label>
            <Textarea
              id="comments"
              placeholder="Provide additional details about the issue..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Reporting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportQuestionDialog;