import { cn } from '@/lib/utils';

interface PresenceStatusTextProps {
  status: 'online' | 'idle' | 'offline' | null;
  lastSeen?: string;
  className?: string;
}

const PresenceStatusText = ({ status, lastSeen, className }: PresenceStatusTextProps) => {
  const getStatusText = () => {
    if (!status || status === 'offline') {
      if (lastSeen) {
        const lastSeenDate = new Date(lastSeen);
        const now = new Date();
        const diffMs = now.getTime() - lastSeenDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Last seen just now';
        if (diffMins < 60) return `Last seen ${diffMins} min ago`;
        if (diffHours < 24) return `Last seen ${diffHours}h ago`;
        return `Last seen ${diffDays}d ago`;
      }
      return 'Offline';
    }
    
    if (status === 'idle') {
      return 'Idle';
    }
    
    return 'Online';
  };

  const statusColor = {
    online: 'text-green-600 dark:text-green-500',
    idle: 'text-amber-600 dark:text-amber-500',
    offline: 'text-muted-foreground'
  };

  const currentStatus = status || 'offline';

  return (
    <span className={cn(
      'text-xs',
      statusColor[currentStatus],
      className
    )}>
      • {getStatusText()}
    </span>
  );
};

export default PresenceStatusText;
