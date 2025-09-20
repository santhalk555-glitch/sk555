import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, BookOpen, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  metadata: any;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchActivities();
    
    // Set up real-time subscription for activities
    const channel = supabase
      .channel('activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'recent_activities',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newActivity = payload.new as Activity;
          setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 latest
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('recent_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setActivities(data);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return <Trophy className="h-4 w-4" />;
      case 'friend_added':
        return <Users className="h-4 w-4" />;
      case 'study_session':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return 'bg-primary/10 text-primary';
      case 'friend_added':
        return 'bg-green-500/10 text-green-500';
      case 'study_session':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`p-2 rounded-full ${getActivityColor(activity.activity_type)}`}>
                {getActivityIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.description}</p>
                {activity.metadata && activity.metadata.points_earned && (
                  <Badge variant="secondary" className="mt-1">
                    {activity.metadata.points_earned > 0 ? '+' : ''}{activity.metadata.points_earned} points
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};