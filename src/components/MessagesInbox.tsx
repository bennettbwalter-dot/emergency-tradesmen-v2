import { useState, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { getConversations, getMessages, sendMessage, markAsRead, simulateReply } from "@/lib/chat";
import { getBusinessById } from "@/lib/businesses";

export function MessagesInbox() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState(getConversations());
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const handleChatUpdate = () => {
            setConversations(getConversations());
            if (activeConvId) {
                setMessages(getMessages(activeConvId));
            }
        };

        window.addEventListener('chat-updated', handleChatUpdate);
        return () => window.removeEventListener('chat-updated', handleChatUpdate);
    }, [activeConvId]);

    useEffect(() => {
        if (activeConvId) {
            setMessages(getMessages(activeConvId));
            markAsRead(activeConvId);
        }
    }, [activeConvId]);

    const handleSendEmail = () => {
        if (!newMessage.trim() || !activeConvId || !user) return;

        const conv = conversations.find(c => c.id === activeConvId);
        if (!conv) return;

        // Get business details to find email
        const businessData = getBusinessById(conv.businessId);
        const businessEmail = businessData?.business?.email;

        // If business has email, open mailto
        if (businessEmail) {
            const subject = encodeURIComponent(`Message from ${user.name} via Emergency Tradesmen`);
            const body = encodeURIComponent(
                `Hi ${conv.businessName},\n\n${newMessage}\n\n---\nFrom: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'Not provided'}\n\nSent via Emergency Tradesmen UK`
            );
            window.location.href = `mailto:${businessEmail}?subject=${subject}&body=${body}`;
        }

        // Also add to local chat history
        sendMessage(activeConvId, newMessage, user.id);
        setNewMessage("");
        simulateReply(activeConvId, conv.businessName);
    };

    const userConversations = conversations.filter(c => c.userId === user?.id);

    if (userConversations.length === 0) {
        return (
            <Card className="p-12 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p>Click "Message" on a business profile to start a conversation.</p>
            </Card>
        );
    }

    const activeConv = conversations.find(c => c.id === activeConvId) || userConversations[0];
    const displayMessages = activeConvId ? messages : getMessages(activeConv.id);
    const businessData = getBusinessById(activeConv.businessId);
    const businessEmail = businessData?.business?.email;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
            {/* Conversations List */}
            <div className="md:col-span-1 border rounded-lg overflow-y-auto">
                <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-semibold">Conversations</h3>
                </div>
                {userConversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => setActiveConvId(conv.id)}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${(activeConvId === conv.id || (!activeConvId && conv.id === activeConv.id)) ? 'bg-muted' : ''
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <Avatar>
                                <AvatarFallback className="bg-gold/10 text-gold">
                                    {conv.businessName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-medium truncate">{conv.businessName}</h4>
                                    {conv.unreadCount > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Conversation */}
            <div className="md:col-span-2 border rounded-lg flex flex-col">
                <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-semibold">{activeConv.businessName}</h3>
                    {businessEmail && (
                        <p className="text-xs text-muted-foreground">Email: {businessEmail}</p>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {displayMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${msg.senderId === user?.id
                                        ? 'bg-gold text-gold-foreground'
                                        : 'bg-muted'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                <span className="text-xs opacity-70">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t">
                    {businessEmail ? (
                        <>
                            <p className="text-xs text-muted-foreground mb-2">
                                ✉️ Clicking send will open your email client to send to: {businessEmail}
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendEmail()}
                                    placeholder="Type your message..."
                                />
                                <Button onClick={handleSendEmail} className="bg-gold hover:bg-gold/90">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-sm text-muted-foreground">
                            <p>This business doesn't have an email address on file.</p>
                            <p className="mt-1">Please call them at {businessData?.business?.phone || 'their listed number'}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
