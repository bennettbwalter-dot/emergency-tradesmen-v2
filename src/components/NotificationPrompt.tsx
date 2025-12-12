import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    requestNotificationPermission,
    isNotificationsEnabled,
    showLocalNotification,
    getSavedToken,
} from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function NotificationPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        // Check if notifications are already enabled
        setIsEnabled(isNotificationsEnabled());

        // Show prompt if user is logged in, hasn't dismissed it, and notifications aren't enabled
        const dismissed = localStorage.getItem('notification_prompt_dismissed');
        if (user && !dismissed && !isNotificationsEnabled()) {
            // Delay showing the prompt
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleEnable = async () => {
        setIsLoading(true);
        try {
            const token = await requestNotificationPermission();
            if (token) {
                setIsEnabled(true);
                setShowPrompt(false);
                toast({
                    title: '🔔 Notifications Enabled!',
                    description: 'You\'ll receive alerts for new leads and updates.',
                });

                // Show a test notification
                setTimeout(() => {
                    showLocalNotification(
                        'Welcome to Emergency Tradesmen!',
                        'You\'ll now receive instant alerts for new jobs.'
                    );
                }, 1000);
            } else {
                toast({
                    title: 'Permission Denied',
                    description: 'You can enable notifications later in your browser settings.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error enabling notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('notification_prompt_dismissed', 'true');
    };

    if (!showPrompt || isEnabled) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-xl p-4 z-50 animate-fade-up">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
                <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
                <div className="p-2 bg-gold/10 rounded-full">
                    <Bell className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">
                        Enable Notifications?
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        Get instant alerts when you receive new quote requests or leads.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleEnable}
                            disabled={isLoading}
                            className="bg-gold hover:bg-gold/90 text-gold-foreground"
                        >
                            {isLoading ? 'Enabling...' : 'Enable'}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleDismiss}
                        >
                            Maybe Later
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook for notification status
export function useNotifications() {
    const [enabled, setEnabled] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setEnabled(isNotificationsEnabled());
        setToken(getSavedToken());
    }, []);

    const enable = async () => {
        const newToken = await requestNotificationPermission();
        if (newToken) {
            setEnabled(true);
            setToken(newToken);
        }
        return newToken;
    };

    return { enabled, token, enable };
}
