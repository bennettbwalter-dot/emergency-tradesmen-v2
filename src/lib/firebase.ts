/**
 * Firebase Push Notification Service
 * 
 * Handles Push Notifications for real-time updates (e.g. new leads, quotes).
 */

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// VAPID key for web push (generate from Firebase Console > Project Settings > Cloud Messaging)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

// Initialize Firebase only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get messaging instance (only in browser with service worker support)
let messaging: ReturnType<typeof getMessaging> | null = null;

const initMessaging = async () => {
    if (typeof window !== 'undefined' && (await isSupported())) {
        messaging = getMessaging(app);
    }
    return messaging;
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return null;
        }

        console.log('Notification permission granted');

        // Initialize messaging
        const msg = await initMessaging();
        if (!msg) {
            console.log('Firebase messaging not supported');
            return null;
        }

        // Get FCM token
        if (!VAPID_KEY) {
            console.warn('VAPID key not configured - using demo mode');
            return 'demo-fcm-token';
        }

        const token = await getToken(msg, { vapidKey: VAPID_KEY });
        console.log('FCM Token:', token);

        return token;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return null;
    }
};

/**
 * Check if notifications are enabled
 */
export const isNotificationsEnabled = (): boolean => {
    if (!('Notification' in window)) return false;
    return Notification.permission === 'granted';
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = (): Promise<any> => {
    return new Promise(async (resolve) => {
        const msg = await initMessaging();
        if (!msg) return;

        onMessage(msg, (payload) => {
            console.log('Message received:', payload);
            resolve(payload);
        });
    });
};

/**
 * Show a local notification (for demo/testing)
 */
export const showLocalNotification = (title: string, body: string, icon?: string) => {
    if (!isNotificationsEnabled()) {
        console.log('Notifications not enabled');
        return;
    }

    new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'emergency-tradesmen',
    });
};

/**
 * Send FCM token to backend for storage
 */
export const saveFCMToken = async (token: string, userId: string) => {
    // In production, save to Supabase: supabase.from('user_tokens').upsert(...)
    console.log('Would save FCM token for user:', userId, token);
    localStorage.setItem('fcm_token', token);
};

/**
 * Get saved FCM token
 */
export const getSavedToken = (): string | null => {
    return localStorage.getItem('fcm_token');
};
