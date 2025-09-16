import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, User, BookOpen, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  course_name: string;
  subjects: string[];
  competitive_exams: string[];
  display_user_id: string;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender_profile: Profile;
}

interface FriendRequestPopupProps {
  friendRequest: FriendRequest;
  onClose: () => void;
  onResponse: (accepted: boolean) => void;
}

const FriendRequestPopup = ({ friendRequest, onClose, onResponse }: FriendRequestPopupProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResponse = async (accept: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ 
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', friendRequest.id);

      if (error) throw error;

      toast({
        title: accept ? '🎉 Friend Added!' : 'Request Rejected',
        description: accept 
          ? `You and ${friendRequest.sender_profile.display_user_id} are now study partners!`
          : 'Friend request declined.',
      });

      onResponse(accept);
      onClose();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to friend request. Please try again.',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="bg-gradient-card border-primary/30 shadow-2xl max-w-md w-full animate-in slide-in-from-bottom-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Friend Request!</CardTitle>
          <CardDescription>
            Someone wants to be your study partner
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Profile Info */}
          <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3 text-xl">
              {friendRequest.sender_profile?.display_user_id 
                ? String(friendRequest.sender_profile.display_user_id).charAt(0) 
                : <User className="w-6 h-6" />}
            </div>
            
            <h3 className="font-bold text-lg mb-1">
              User #{friendRequest.sender_profile?.display_user_id || 'Unknown'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">
              {friendRequest.sender_profile?.course_name || 'Student'}
            </p>

            {/* Subjects */}
            {friendRequest.sender_profile?.subjects && friendRequest.sender_profile.subjects.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs font-semibold">Subjects</span>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {friendRequest.sender_profile.subjects.slice(0, 3).map((subject, idx) => (
                    <Badge 
                      key={idx}
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {subject}
                    </Badge>
                  ))}
                  {friendRequest.sender_profile.subjects.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{friendRequest.sender_profile.subjects.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Exams */}
            {friendRequest.sender_profile?.competitive_exams && friendRequest.sender_profile.competitive_exams.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-3 h-3" />
                  <span className="text-xs font-semibold">Exams</span>
                </div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {friendRequest.sender_profile.competitive_exams.slice(0, 2).map((exam, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline"
                      className="text-xs bg-secondary/10 border-secondary/20"
                    >
                      {exam}
                    </Badge>
                  ))}
                  {friendRequest.sender_profile.competitive_exams.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{friendRequest.sender_profile.competitive_exams.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 hover:text-red-700"
              onClick={() => handleResponse(false)}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            
            <Button
              variant="default"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-glow"
              onClick={() => handleResponse(true)}
              disabled={loading}
            >
              <Heart className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-full text-muted-foreground"
          >
            Decide Later
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FriendRequestPopup;