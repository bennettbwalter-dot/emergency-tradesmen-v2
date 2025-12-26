
export interface Message {
    text: string;
    role: 'user' | 'model';
    timestamp: Date;
}

export interface HybridCallbacks {
    onMessage?: (text: string, role: 'user' | 'model') => void;
    onNavigate?: (view: string) => void;
    onVolume?: (volume: number) => void;
    onError?: (error: any) => void;
    onStatusChange?: (status: 'Connecting...' | 'Hearing you...' | 'Awaiting Voice...' | 'Thinking...' | 'Speaking...') => void;
}
