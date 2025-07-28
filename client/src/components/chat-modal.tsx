import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Send, X } from "lucide-react";
import type { User, Chat } from "@shared/schema";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: User;
}

export default function ChatModal({ open, onOpenChange, currentUser }: ChatModalProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat"],
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: open,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: api.sendChatMessage,
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      sender: "user",
      message: message.trim(),
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[500px] flex flex-col p-0">
        <DialogHeader className="bg-[var(--bri-blue)] text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-semibold">Live Chat - Customer Service</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg: Chat) => {
            const isAdmin = msg.sender === 'admin';
            return (
              <div key={msg.id} className={`flex ${isAdmin ? '' : 'justify-end'}`}>
                <div className={`chat-bubble px-3 py-2 rounded-lg ${
                  isAdmin 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-[var(--bri-blue)] text-white'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <span className={`text-xs ${
                    isAdmin ? 'text-gray-500' : 'text-blue-200'
                  }`}>
                    {formatTime(msg.waktu)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="flex-1 rounded-full"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-[var(--bri-blue)] hover:bg-blue-700 rounded-full px-4"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
