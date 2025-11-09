import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClockSync = () => {
  const [clockOffset, setClockOffset] = useState(0);
  const [isSynced, setIsSynced] = useState(false);

  const syncClock = useCallback(async () => {
    try {
      const clientSendTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('clock-sync', {
        method: 'GET'
      });

      if (error) {
        console.error('Clock sync error:', error);
        return;
      }

      const clientReceiveTime = Date.now();
      const serverTime = data.serverTime;
      
      // Calculate round-trip time and estimate server time at midpoint
      const roundTripTime = clientReceiveTime - clientSendTime;
      const estimatedServerTime = serverTime + (roundTripTime / 2);
      
      // Calculate clock offset (server time - client time)
      const offset = estimatedServerTime - clientReceiveTime;
      
      console.log('Clock sync:', {
        clientTime: clientReceiveTime,
        serverTime,
        roundTripTime,
        offset
      });

      setClockOffset(offset);
      setIsSynced(true);
    } catch (error) {
      console.error('Clock sync failed:', error);
    }
  }, []);

  useEffect(() => {
    // Initial sync
    syncClock();

    // Resync every 30 seconds
    const interval = setInterval(syncClock, 30000);

    return () => clearInterval(interval);
  }, [syncClock]);

  const getServerTime = useCallback(() => {
    return Date.now() + clockOffset;
  }, [clockOffset]);

  return { clockOffset, isSynced, getServerTime, syncClock };
};