import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Send, Users, Crown } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Lobby {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  difficulty: string;
  subject: string;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lobby: Lobby | null;
}

const InviteModal = ({ isOpen, onClose, lobby }: InviteModalProps) => {
  const [userId, setUserId] = useState("");
  const [inviteCode] = useState("QUIZ-" + Math.random().toString(36).substring(2, 8).toUpperCase());
  const { toast } = useToast();

  const handleSendInvite = () => {
    if (!userId.trim()) {
      toast({
        title: "User ID Required",
        description: "Please enter a valid user ID to send the invite.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Invite Sent!",
      description: `Invitation sent to user ${userId} for ${lobby?.name}`,
    });
    
    setUserId("");
    onClose();
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
  };

  const handleCopyLobbyLink = () => {
    const lobbyLink = `https://studymatch.app/lobby/${lobby?.id}`;
    navigator.clipboard.writeText(lobbyLink);
    toast({
      title: "Link Copied!",
      description: "Lobby link copied to clipboard",
    });
  };

  if (!lobby) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-gaming-primary" />
            Invite Players
          </DialogTitle>
          <DialogDescription>
            Invite friends to join {lobby.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lobby Info */}
          <div className="bg-gradient-card p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{lobby.name}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <Crown className="w-4 h-4 mr-1" />
                {lobby.host}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {lobby.players}/{lobby.maxPlayers} players • {lobby.subject} • {lobby.difficulty}
            </div>
          </div>

          {/* Invite by User ID */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">Invite by User ID</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter user ID (e.g. @username123)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="gaming" 
                  onClick={handleSendInvite}
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                They'll receive a notification to join your lobby
              </p>
            </div>
          </div>

          {/* Invite Code */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">Share Invite Code</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm text-center">
                  {inviteCode}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopyInviteCode}
                  className="px-3"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this code for others to join directly
              </p>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">Share Lobby Link</label>
              <Button 
                variant="outline" 
                onClick={handleCopyLobbyLink}
                className="w-full justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Lobby Link
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Perfect for sharing on social media or messaging apps
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;