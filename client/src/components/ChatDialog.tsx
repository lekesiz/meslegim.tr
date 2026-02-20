import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { Send } from 'lucide-react';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherUser: { id: number; name: string | null };
  currentUserRole: string;
}

export function ChatDialog({ open, onOpenChange, otherUser, currentUserRole }: ChatDialogProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Determine which endpoint to use based on current user role
  const isMentor = currentUserRole.includes('mentor');
  const router = isMentor ? trpc.mentor : trpc.student;
  
  const { data: conversation = [], refetch } = router.getConversation.useQuery(
    { otherUserId: otherUser.id },
    { enabled: open }
  );
  
  const sendMutation = router.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      refetch();
    },
  });
  
  const markAsReadMutation = router.markMessagesAsRead.useMutation();
  
  useEffect(() => {
    if (open && conversation.length > 0) {
      // Mark messages as read when dialog opens
      markAsReadMutation.mutate({ otherUserId: otherUser.id });
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, conversation.length, otherUser.id]);
  
  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMutation.mutate({
      receiverId: otherUser.id,
      message: message.trim(),
    });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {otherUser.name || 'Kullanıcı'} ile Mesajlaşma
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
          {conversation.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Henüz mesaj yok. İlk mesajı gönderin!
            </div>
          ) : (
            conversation.map((msg: any) => {
              const isCurrentUser = msg.senderId !== otherUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın... (Enter: gönder, Shift+Enter: yeni satır)"
            className="resize-none"
            rows={3}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            size="icon"
            className="h-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
