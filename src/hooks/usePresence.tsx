import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

const HEARTBEAT_INTERVAL = 25000; // 25 seconds
const IDLE_TIMEOUT = 180000; // 3 minutes of inactivity = idle

interface PresenceData {
  user_id: string;
  status: 'online' | 'idle' | 'offline';
  last_seen: string;
}

export const usePresence = () => {
  const { user } = useAuth();
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const lastActivity = useRef(Date.now());

  const updatePresence = async (status: 'online' | 'idle' | 'offline') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating presence:', error);
      }
    } catch (error) {
      console.error('Error in updatePresence:', error);
    }
  };

  const resetIdleTimer = () => {
    lastActivity.current = Date.now();
    
    if (isIdle) {
      setIsIdle(false);
      updatePresence('online');
    }

    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }

    idleTimeout.current = setTimeout(() => {
      setIsIdle(true);
      updatePresence('idle');
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    if (!user) return;

    // Set initial online status
    updatePresence('online');

    // Start heartbeat
    heartbeatInterval.current = setInterval(() => {
      const status = isIdle ? 'idle' : 'online';
      updatePresence(status);
    }, HEARTBEAT_INTERVAL);

    // Track user activity for idle detection
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Initialize idle timer
    resetIdleTimer();

    // Handle visibility change (tab focus/blur)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, mark as idle after a delay
        setTimeout(() => {
          if (document.hidden) {
            updatePresence('idle');
          }
        }, 60000); // 1 minute
      } else {
        // Tab is visible again
        resetIdleTimer();
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount or user change
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
      
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Set offline status when leaving
      updatePresence('offline');
    };
  }, [user, isIdle]);

  return { updatePresence };
};

// Hook to get presence for multiple users
export const useUserPresence = (userIds: string[]) => {
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceData>>({});

  useEffect(() => {
    if (!userIds.length) return;

    // Fetch initial presence data
    const fetchPresence = async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .in('user_id', userIds);

      if (!error && data) {
        const map: Record<string, PresenceData> = {};
        data.forEach((p: any) => {
          map[p.user_id] = p;
        });
        setPresenceMap(map);
      }
    };

    fetchPresence();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=in.(${userIds.join(',')})`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setPresenceMap(prev => ({
              ...prev,
              [payload.new.user_id]: payload.new
            }));
          } else if (payload.eventType === 'DELETE') {
            setPresenceMap(prev => {
              const newMap = { ...prev };
              delete newMap[payload.old.user_id];
              return newMap;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [JSON.stringify(userIds)]);

  return presenceMap;
};
