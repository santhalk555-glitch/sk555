import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Send, MoreVertical, Ban, Flag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BanUserDialog from "./BanUserDialog";
import ReportUserDialog from "./ReportUserDialog";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  display_user_id: string;
  username: string;
  course_name: string;
  subjects: string[];
  competitive_exams: string[];
}

interface ChatProps {
  friend: Profile;
  onBack: () => void;
}

const Chat = ({ friend, onBack }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && friend) {
      loadMessages();
      const cleanup = setupRealtimeUpdates();
      
      return cleanup;
    }
  }, [user, friend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const setupRealtimeUpdates = () => {
    if (!user) return;

    const channel = supabase
      .channel(`chat-${user.id}-${friend.user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          
          // Only add messages that belong to this conversation
          if (
            (newMessage.sender_id === user.id && newMessage.receiver_id === friend.user_id) ||
            (newMessage.sender_id === friend.user_id && newMessage.receiver_id === user.id)
          ) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.find(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.user_id}),and(sender_id.eq.${friend.user_id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    const messageId = crypto.randomUUID();
    
    // Create optimistic message for immediate UI update
    const optimisticMessage: Message = {
      id: messageId,
      sender_id: user.id,
      receiver_id: friend.user_id,
      content: messageContent,
      created_at: new Date().toISOString(),
      read_at: null
    };

    // Add message immediately to UI
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(""); // Clear input immediately

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          sender_id: user.id,
          receiver_id: friend.user_id,
          content: messageContent
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setNewMessage(messageContent); // Restore message content
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="pt-20 pb-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 min-h-screen flex flex-col bg-gradient-to-b from-chat-bg-start to-chat-bg-end font-poppins">
      <div className="container mx-auto px-6 flex-1 flex flex-col max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Study Squad
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">Chat with @{friend.username}</h1>
            <p className="text-muted-foreground">{friend.course_name}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={() => setBanDialogOpen(true)}
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setReportDialogOpen(true)}
              >
                <Flag className="w-4 h-4 mr-2" />
                Report User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col bg-transparent border-none shadow-none">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-2 py-6">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12 text-[15px]">
                    No messages yet. Start the conversation! 💬
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-[14px] py-[10px] shadow-[0_2px_6px_rgba(0,0,0,0.1)] ${
                            isMe
                              ? 'bg-chat-sent text-chat-sent-foreground rounded-[18px_18px_0_18px]'
                              : 'bg-chat-received text-chat-received-foreground rounded-[18px_18px_18px_0]'
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed break-words">{message.content}</p>
                          <p className="text-[12px] mt-1 text-chat-timestamp">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Message Input */}
            <div className="p-4 bg-white/60 backdrop-blur-sm border-t border-white/40">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-white/80 border-white/60 focus-visible:ring-chat-sent rounded-[18px] text-[15px] placeholder:text-muted-foreground/60"
                  autoFocus
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-chat-sent hover:bg-chat-sent/90 text-white rounded-[18px] px-5 shadow-[0_2px_6px_rgba(79,142,247,0.3)] transition-all hover:shadow-[0_4px_12px_rgba(79,142,247,0.4)] disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ban & Report Dialogs */}
        <BanUserDialog
          open={banDialogOpen}
          onOpenChange={setBanDialogOpen}
          userId={friend.user_id}
          username={friend.username}
          onBanComplete={onBack}
        />
        <ReportUserDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          userId={friend.user_id}
          username={friend.username}
        />
      </div>
    </div>
  );
};

export default Chat;