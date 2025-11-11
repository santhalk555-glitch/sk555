import { usePresence } from '@/hooks/usePresence';

interface PresenceProviderProps {
  children: React.ReactNode;
}

export const PresenceProvider = ({ children }: PresenceProviderProps) => {
  // Initialize presence tracking for the current user
  usePresence();
  
  return <>{children}</>;
};
