
export enum AppView {
    DASHBOARD = 'dashboard',
    SERVICES = 'services',
    BLOG = 'blog',
    PREMIUM = 'premium',
    CONTACT = 'contact',
    ANALYTICS = 'analytics',
    SETTINGS = 'settings',
    PROFILE = 'profile',
}

export interface Message {
    text: string;
    role: 'user' | 'model';
    timestamp: Date;
}
