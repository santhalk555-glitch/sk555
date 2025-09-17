import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Heart, 
  X, 
  Star, 
  BookOpen, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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
  responded_at: string | null;
  sender_profile?: Profile;
  receiver_profile?: Profile;
}

interface FriendRequestsProps {
  onBack: () => void;
}

const FriendRequests = ({ onBack }: FriendRequestsProps) => {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadFriendRequests();
      setupRealtimeListeners();
    }
  }, [user]);

  const loadFriendRequests = async () => {
    if (!user) return;

    try {
      // Load received requests
      const { data: received, error: receivedError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Load sent requests
      const { data: sent, error: sentError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      if (sentError) throw sentError;

      // Get profiles for received requests
      const receivedWithProfiles = await Promise.all(
        (received || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', request.sender_id)
            .single();
          return { ...request, sender_profile: profile };
        })
      );

      // Get profiles for sent requests  
      const sentWithProfiles = await Promise.all(
        (sent || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', request.receiver_id)
            .single();
          return { ...request, receiver_profile: profile };
        })
      );

      setReceivedRequests(receivedWithProfiles);
      setSentRequests(sentWithProfiles);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friend requests.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    if (!user) return;

    const channel = supabase
      .channel('friend-requests-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `receiver_id=eq.${user.id}`
        },
        () => loadFriendRequests()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_requests',
          filter: `sender_id=eq.${user.id}`
        },
        () => loadFriendRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleResponse = async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ 
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: accept ? '🎉 Friend Added!' : 'Request Rejected',
        description: accept 
          ? 'You are now study partners!'
          : 'Friend request declined.',
      });

      loadFriendRequests();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to friend request.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="pt-20 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading friend requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Friend Requests
            </h1>
            <p className="text-muted-foreground">
              Manage your study partner requests
            </p>
          </div>
          
          <div></div>
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Received ({receivedRequests.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {receivedRequests.length === 0 ? (
              <Card className="bg-gradient-card border-border">
                <CardContent className="p-8 text-center">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No friend requests</h3>
                  <p className="text-muted-foreground">
                    When someone likes your profile, their request will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              receivedRequests.map((request) => (
                <Card key={request.id} className="bg-gradient-card border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl">
                          {request.sender_profile?.display_user_id 
                            ? String(request.sender_profile.display_user_id).charAt(0) 
                            : <User className="w-6 h-6" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            User #{request.sender_profile?.display_user_id || 'Unknown'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.sender_profile?.course_name || 'Student'}
                          </p>
                          
                          {/* Subjects */}
                          {request.sender_profile?.subjects && request.sender_profile.subjects.length > 0 && (
                            <div className="mb-2">
                              <div className="flex items-center gap-1 mb-1">
                                <BookOpen className="w-3 h-3" />
                                <span className="text-xs font-semibold">Subjects</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {request.sender_profile.subjects.slice(0, 3).map((subject, idx) => (
                                  <Badge 
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs bg-primary/10 text-primary border-primary/20"
                                  >
                                    {subject}
                                  </Badge>
                                ))}
                                {request.sender_profile.subjects.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{request.sender_profile.subjects.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Exams */}
                          {request.sender_profile?.competitive_exams && request.sender_profile.competitive_exams.length > 0 && (
                            <div className="mb-2">
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="w-3 h-3" />
                                <span className="text-xs font-semibold">Exams</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {request.sender_profile.competitive_exams.slice(0, 2).map((exam, idx) => (
                                  <Badge 
                                    key={idx}
                                    variant="outline"
                                    className="text-xs bg-secondary/10 border-secondary/20"
                                  >
                                    {exam}
                                  </Badge>
                                ))}
                                {request.sender_profile.competitive_exams.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{request.sender_profile.competitive_exams.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(request.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(request.status)}
                        {request.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600"
                              onClick={() => handleResponse(request.id, false)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleResponse(request.id, true)}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sentRequests.length === 0 ? (
              <Card className="bg-gradient-card border-border">
                <CardContent className="p-8 text-center">
                  <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No sent requests</h3>
                  <p className="text-muted-foreground">
                    Like profiles in the matching section to send friend requests.
                  </p>
                </CardContent>
              </Card>
            ) : (
              sentRequests.map((request) => (
                <Card key={request.id} className="bg-gradient-card border-secondary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center text-xl">
                          {request.receiver_profile?.display_user_id 
                            ? String(request.receiver_profile.display_user_id).charAt(0) 
                            : <User className="w-6 h-6" />}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            User #{request.receiver_profile?.display_user_id || 'Unknown'}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {request.receiver_profile?.course_name || 'Student'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sent {formatTimeAgo(request.created_at)}
                            {request.responded_at && ` • Responded ${formatTimeAgo(request.responded_at)}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FriendRequests;