// Admin-specific availability page (no header/footer)
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Power, CheckCircle, XCircle } from "lucide-react";

export default function AvailabilityPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isAvailable, setIsAvailable] = useState(false);
    const [businessProfile, setBusinessProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            checkAvailability();
        }
    }, [user]);

    async function checkAvailability() {
        const { data: businesses } = await supabase
            .from('businesses')
            .select('*')
            .or(`owner_id.eq.${user?.id},owner_user_id.eq.${user?.id}`);

        const data = businesses?.[0];

        if (data) {
            setBusinessProfile(data);
            const lastPing = data.last_available_ping ? new Date(data.last_available_ping) : null;
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            const isFreshPing = !!(lastPing && lastPing > oneHourAgo);
            const isExplicitlyAvailable = data.is_available_now === true;

            setIsAvailable(isFreshPing || isExplicitlyAvailable);
        }
        setLoading(false);
    }

    async function toggleAvailability() {
        if (!businessProfile) return;

        const newStatus = !isAvailable;
        const pingTime = newStatus ? new Date().toISOString() : null;

        setIsAvailable(newStatus); // Optimistic update

        const { error } = await supabase
            .from('businesses')
            .update({
                last_available_ping: pingTime,
                is_available_now: newStatus
            })
            .eq('id', businessProfile.id);

        if (error) {
            console.error('Error updating availability', error);
            setIsAvailable(!newStatus); // Revert
            toast({ title: "Error", description: "Could not update status", variant: "destructive" });
        } else {
            toast({
                title: newStatus ? "You are LIVE!" : "You are offline",
                description: newStatus ? "Customers can see you are available now." : "Your availability badge is hidden."
            });
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!businessProfile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Business Profile</CardTitle>
                    <CardDescription>
                        You need to create a business profile first using the Profile Editor.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display text-foreground mb-2">Availability Management</h1>
                <p className="text-muted-foreground">
                    Control your online availability status for customers
                </p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Power className="w-5 h-5" />
                            Current Status
                        </CardTitle>
                        <CardDescription>
                            {businessProfile.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                            <div>
                                <p className="font-medium mb-1">Availability Status</p>
                                <p className="text-sm text-muted-foreground">
                                    {isAvailable
                                        ? "You are visible to customers as 'Available Now'"
                                        : "You are currently offline"
                                    }
                                </p>
                            </div>
                            <Badge variant={isAvailable ? "default" : "secondary"} className="px-4 py-2">
                                {isAvailable ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Online
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Offline
                                    </>
                                )}
                            </Badge>
                        </div>

                        {/* Toggle Control */}
                        <div className="flex items-center justify-between p-6 bg-card border border-border rounded-lg">
                            <div>
                                <p className="font-semibold text-lg mb-1">Toggle Availability</p>
                                <p className="text-sm text-muted-foreground">
                                    Click to switch between online and offline
                                </p>
                            </div>
                            <div
                                className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ${isAvailable ? 'bg-green-500' : 'bg-slate-300'
                                    }`}
                                onClick={toggleAvailability}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isAvailable ? 'translate-x-8' : 'translate-x-0'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-xs text-muted-foreground p-4 bg-secondary/20 rounded border border-border">
                            <p className="font-semibold mb-2">How it works:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>When online, customers see you're available for immediate work</li>
                                <li>When offline, your availability badge is hidden</li>
                                <li>Your profile remains visible in search results either way</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
