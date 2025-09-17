import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    <div className="pt-20 pb-12 min-h-screen flex flex-col">
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
          
          <div className="w-24" /> {/* Spacer for centering */}
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col bg-gradient-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isMe
                              ? 'bg-gaming-primary text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
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
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                  autoFocus
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gaming-primary hover:bg-gaming-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;