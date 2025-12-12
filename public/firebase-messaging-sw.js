// Firebase Messaging Service Worker
// This file must be at the root of the public directory

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: self.FIREBASE_CONFIG?.apiKey || '',
    authDomain: self.FIREBASE_CONFIG?.authDomain || '',
    projectId: self.FIREBASE_CONFIG?.projectId || '',
    storageBucket: self.FIREBASE_CONFIG?.storageBucket || '',
    messagingSenderId: self.FIREBASE_CONFIG?.messagingSenderId || '',
    appId: self.FIREBASE_CONFIG?.appId || '',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Emergency Tradesmen';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'emergency-tradesmen-notification',
        data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);
    event.notification.close();

    // Open the app or focus existing window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
