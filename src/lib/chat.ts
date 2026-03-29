import { Business } from "./businesses";

export interface ChatMessage {
    id: string;
    senderId: string; // 'user' or businessId
    receiverId: string;
    content: string;
    timestamp: string;
    read: boolean;
    isSystemMessage?: boolean;
}

export interface Conversation {
    id: string;
    businessId: string;
    businessName: string; // Cached for display
    businessImage?: string; // Cached/Placeholder
    userId: string;
    lastMessage: ChatMessage;
    unreadCount: number;
    updatedAt: string;
}

const CHAT_STORAGE_KEY = "emergency_tradesmen_chats";

// Helper to get all conversations
export function getConversations(): Conversation[] {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored).sort((a: Conversation, b: Conversation) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

// Get messages for a specific conversation
export function getMessages(conversationId: string): ChatMessage[] {
    const key = `emergency_tradesmen_messages_${conversationId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

// Start a new conversation or get existing one
export function startConversation(business: Business, userId: string): string {
    const conversations = getConversations();
    const existing = conversations.find(c => c.businessId === business.id && c.userId === userId);

    if (existing) return existing.id;

    const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newConversation: Conversation = {
        id: newId,
        businessId: business.id,
        businessName: business.name,
        userId,
        lastMessage: {
            id: `msg_init_${Date.now()}`,
            senderId: business.id,
            receiverId: userId,
            content: "Hi there! How can I help you today?",
            timestamp: now,
            read: false
        },
        unreadCount: 1,
        updatedAt: now
    };

    saveConversations([...conversations, newConversation]);

    // Initialize messages
    const initialMessages: ChatMessage[] = [{
        id: `msg_init_${Date.now()}`,
        senderId: business.id,
        receiverId: userId,
        content: `Hi there! Thanks for checking out ${business.name}. How can I help you today?`,
        timestamp: now,
        read: false
    }];

    saveMessages(newId, initialMessages);

    return newId;
}

// Send a message
export function sendMessage(conversationId: string, content: string, senderId: string): ChatMessage {
    const messages = getMessages(conversationId);
    const now = new Date().toISOString();

    const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId,
        receiverId: 'unknown', // Simplified logic
        content,
        timestamp: now,
        read: false
    };

    const updatedMessages = [...messages, newMessage];
    saveMessages(conversationId, updatedMessages);

    // Update conversation metadata
    const conversations = getConversations();
    const convIndex = conversations.findIndex(c => c.id === conversationId);

    if (convIndex !== -1) {
        const conv = conversations[convIndex];
        conv.lastMessage = newMessage;
        conv.updatedAt = now;
        // If user sent it, business hasn't read it (conceptually), but for our UI we only care about user's unread
        if (senderId !== 'user') {
            conv.unreadCount += 1;
        }
        conversations[convIndex] = conv;
        saveConversations(conversations);
    }

    return newMessage;
}

// Simulate a reply from the business
export function simulateReply(conversationId: string, businessName: string) {
    setTimeout(() => {
        const replies = [
            "Thanks for your message. I'm currently on a job but will get back to you shortly!",
            "Could you provide your postcode so I can check if I cover your area?",
            "Do you have any photos of the issue?",
            "I can pop round tomorrow morning to take a look if that suits?",
            "Is this an emergency query?"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        // We assume 'user' is the one sending the initial message, so business ID replies
        // Ideally we'd look up the business ID from the conversation, but for simulation let's cheat slightly
        // and assume any non-'user' sender is the business.
        // In startConversation we know businessId. Let's look it up.
        const conversations = getConversations();
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
            sendMessage(conversationId, randomReply, conv.businessId);

            // Trigger a custom event so UI can update if listening
            window.dispatchEvent(new CustomEvent('chat-updated', { detail: { conversationId } }));
        }
    }, 2500 + Math.random() * 2000); // 2.5 - 4.5s delay
}

export function markAsRead(conversationId: string) {
    const conversations = getConversations();
    const index = conversations.findIndex(c => c.id === conversationId);
    if (index !== -1 && conversations[index].unreadCount > 0) {
        conversations[index].unreadCount = 0;
        saveConversations(conversations);
        window.dispatchEvent(new CustomEvent('chat-updated', { detail: { conversationId } }));
    }
}

// Internal Storage Helpers
function saveConversations(conversations: Conversation[]) {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
}

function saveMessages(conversationId: string, messages: ChatMessage[]) {
    localStorage.setItem(`emergency_tradesmen_messages_${conversationId}`, JSON.stringify(messages));
}

// Hook helper to get total unread count across all conversations
export function getTotalUnreadCount(userId: string): number {
    const conversations = getConversations();
    return conversations
        .filter(c => c.userId === userId)
        .reduce((sum, c) => sum + c.unreadCount, 0);
}
