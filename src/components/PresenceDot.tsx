import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PresenceDotProps {
  status: 'online' | 'idle' | 'offline' | null;
  lastSeen?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const PresenceDot = ({ 
  status, 
  lastSeen, 
  size = 'md', 
  showTooltip = true,
  className 
}: PresenceDotProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusColors = {
    online: 'bg-green-500',
    idle: 'bg-amber-500',
    offline: 'bg-gray-400'
  };

  const getTooltipText = () => {
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
      return 'Idle — away from keyboard';
    }
    
    return 'Online now';
  };

  const dot = (
    <div 
      className={cn(
        'rounded-full border-2 border-background',
        sizeClasses[size],
        status ? statusColors[status] : 'bg-gray-400 animate-pulse',
        className
      )}
      aria-label={getTooltipText()}
    />
  );

  if (!showTooltip) {
    return dot;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {dot}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PresenceDot;
