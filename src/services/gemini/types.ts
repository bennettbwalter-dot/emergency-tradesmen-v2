
export interface Message {
    text: string;
    role: 'user' | 'model';
    timestamp: Date;
}

export interface HybridCallbacks {
    onMessage?: (text: string, role: 'user' | 'model') => void;
    onNavigate?: (route: string) => void;
    onVolume?: (level: number) => void;
    onError?: (error: Error) => void;
    onStatusChange?: (status: string) => void;
    onDebug?: (info: any) => void;
}
