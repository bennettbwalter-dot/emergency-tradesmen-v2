import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, MoreVertical, Phone, Search, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Conversation,
    ChatMessage,
    getConversations,
    getMessages,
    sendMessage,
    simulateReply,
    markAsRead,
    getTotalUnreadCount
} from "@/lib/chat";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export function ChatSystem() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMobileView, setIsMobileView] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversations
    useEffect(() => {
        if (user) {
            const loadConvos = () => {
                const all = getConversations();
                setConversations(all.filter(c => c.userId === user.id));
            };

            loadConvos();

            // Listen for updates (e.g. new simulated messages)
            const handleUpdate = () => loadConvos();
            window.addEventListener('chat-updated', handleUpdate);

            // Poll every few seconds just in case
            const interval = setInterval(loadConvos, 3000);

            return () => {
                window.removeEventListener('chat-updated', handleUpdate);
                clearInterval(interval);
            };
        }
    }, [user]);

    // Load active messages
    useEffect(() => {
        if (activeConversationId) {
            setMessages(getMessages(activeConversationId));
            markAsRead(activeConversationId);

            // Listen for updates specific to this conversation
            const handleUpdate = (e: CustomEvent) => {
                if (e.detail.conversationId === activeConversationId) {
                    setMessages(getMessages(activeConversationId));
                }
            };
            window.addEventListener('chat-updated', handleUpdate as EventListener);
            return () => window.removeEventListener('chat-updated', handleUpdate as EventListener);
        }
    }, [activeConversationId]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId || !user) return;

        sendMessage(activeConversationId, newMessage, 'user');
        setMessages(getMessages(activeConversationId));
        setNewMessage("");

        // Simulate helper reply
        const conv = conversations.find(c => c.id === activeConversationId);
        if (conv) {
            simulateReply(activeConversationId, conv.businessName);
        }
    };

    // Mobile responsive helper
    useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] border border-border/50 rounded-xl bg-card text-center p-8">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                    Start a conversation with a tradesperson from their profile page to ask questions or discuss a quote.
                </p>
                <Button asChild variant="default" className="bg-gold hover:bg-gold/90 text-gold-foreground">
                    <a href="/">Browse Trades</a>
                </Button>
            </div>
        );
    }

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    return (
        <div className="flex h-[700px] border border-border/50 rounded-xl bg-card overflow-hidden shadow-sm">
            {/* Sidebar List */}
            <div className={`
        w-full md:w-80 border-r border-border/50 flex flex-col bg-secondary/10
        ${activeConversationId && isMobileView ? 'hidden' : 'flex'}
      `}>
                <div className="p-4 border-b border-border/50">
                    <h3 className="font-display text-lg font-semibold mb-4">Messages</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-9 bg-background border-border/50" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {conversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConversationId(conv.id)}
                                className={`
                  flex items-start gap-3 p-4 text-left transition-colors border-b border-border/50 last:border-0
                  ${activeConversationId === conv.id ? 'bg-gold/10 border-l-4 border-l-gold' : 'hover:bg-secondary/50 border-l-4 border-l-transparent'}
                `}
                            >
                                <Avatar>
                                    {/* Placeholder logic for business avatar */}
                                    <AvatarFallback className={`${activeConversationId === conv.id ? 'bg-gold text-gold-foreground' : 'bg-secondary'}`}>
                                        {conv.businessName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-foreground font-bold' : 'text-foreground'}`}>
                                            {conv.businessName}
                                        </span>
                                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                            {new Date(conv.updatedAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : new Date(conv.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                        {conv.lastMessage.senderId === 'user' ? 'You: ' : ''}{conv.lastMessage.content}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-gold text-gold-foreground text-[10px] flex items-center justify-center font-bold">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className={`
        flex-1 flex flex-col bg-background
        ${!activeConversationId && isMobileView ? 'hidden' : 'flex'}
      `}>
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                {isMobileView && (
                                    <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)} className="-ml-2">
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                )}
                                <Avatar>
                                    <AvatarFallback className="bg-gold/10 text-gold font-bold">
                                        {activeConversation.businessName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold leading-none">{activeConversation.businessName}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                                        Online now
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" title="Call">
                                    <a href="tel:000"><Phone className="w-4 h-4" /></a>
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-secondary/5">
                            <div className="space-y-4">
                                {messages.map((msg, idx) => {
                                    const isUser = msg.senderId === 'user';
                                    // Simple date separator logic could go here
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`
                        max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm
                        ${isUser
                                                    ? 'bg-gold text-gold-foreground rounded-br-none'
                                                    : 'bg-card border border-border/50 rounded-bl-none text-foreground'}
                      `}>
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                <p className={`text-[10px] mt-1 text-right opacity-70`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 border-t border-border/50 bg-card">
                            <form onSubmit={handleSend} className="flex items-end gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-secondary/30 min-h-[50px] py-3"
                                    autoFocus
                                />
                                <Button type="submit" size="icon" className="h-[50px] w-[50px] bg-gold hover:bg-gold/90 text-gold-foreground shrink-0">
                                    <Send className="w-5 h-5" />
                                    <span className="sr-only">Send</span>
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground p-8 bg-secondary/5">
                        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
                            <UserIcon className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="text-lg font-medium">Select a conversation</p>
                        <p className="max-w-xs text-center mt-2 text-sm opacity-70">
                            Choose a chat from the sidebar to view history or start a new message.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
