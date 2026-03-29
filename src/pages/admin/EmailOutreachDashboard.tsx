import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Copy, Plus, Activity, Mail, Users, CreditCard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailOutreachDashboard() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('posthog');
    const [posthogUrl, setPosthogUrl] = useState('');

    useEffect(() => {
        const savedUrl = localStorage.getItem('posthog_dashboard_embed_url');
        if (savedUrl) setPosthogUrl(savedUrl);
    }, []);

    const handleSaveUrl = (url: string) => {
        setPosthogUrl(url);
        localStorage.setItem('posthog_dashboard_embed_url', url);
    };

    // Fetch Campaigns
    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['admin-email-campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_campaigns')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    // Toggle Campaign Status
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ id, newStatus }: { id: string, newStatus: string }) => {
            const { error } = await supabase.from('email_campaigns').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-email-campaigns'] });
            toast.success('Campaign status updated');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    // Trigger Orchestrator Manual Run
    const triggerSendMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.functions.invoke('email-orchestrator', {
                method: 'POST'
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['admin-email-campaigns'] });
            toast.success(`Active campaigns processed! (${data?.processed?.length || 0} batches)`);
        },
        onError: (error) => toast.error(`Error triggering send: ${error.message}`)
    });

    if (isLoading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Email Control Centre</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your SaaS outreach, track PostHog funnels, and monitor ROI.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-email-campaigns'] })}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button onClick={() => triggerSendMutation.mutate()} disabled={triggerSendMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                        <Play className="w-4 h-4 mr-2" />
                        {triggerSendMutation.isPending ? 'Processing...' : 'Force Run Orchestrator'}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="posthog">PostHog Analytics</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                </TabsList>

                {/* CAMPAIGNS TAB */}
                <TabsContent value="campaigns" className="mt-6 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Active & Paused Campaigns</h2>
                        <Button variant="default"><Plus className="w-4 h-4 mr-2" /> New Campaign</Button>
                    </div>

                    <div className="grid gap-4">
                        {campaigns?.map(camp => (
                            <Card key={camp.id} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 px-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg">{camp.name}</h3>
                                            <Badge variant={camp.status === 'active' ? 'default' : camp.status === 'completed' ? 'secondary' : 'outline'}
                                                className={camp.status === 'active' ? 'bg-green-500' : ''}>
                                                {camp.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>Target: <strong>{camp.target_country}</strong></span>
                                            <span>Trade: <strong>{camp.target_trade || 'All'}</strong></span>
                                            <span>Variant: <strong>{camp.variant === 'hard_sell' ? 'Hard Sell 🔥' : 'Soft Sell 🤝'}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold">{camp.total_sent || 0}</div>
                                            <div className="text-xs text-muted-foreground uppercase tracking-wider">Sent</div>
                                        </div>

                                        <div className="flex gap-2">
                                            {camp.status === 'paused' ? (
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                                                    onClick={() => toggleStatusMutation.mutate({ id: camp.id, newStatus: 'active' })}>
                                                    <Play className="w-4 h-4 mr-1" /> Resume
                                                </Button>
                                            ) : camp.status === 'active' ? (
                                                <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                                    onClick={() => toggleStatusMutation.mutate({ id: camp.id, newStatus: 'paused' })}>
                                                    <Pause className="w-4 h-4 mr-1" /> Pause
                                                </Button>
                                            ) : null}
                                            <Button size="icon" variant="outline"><Copy className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}

                        {!campaigns?.length && (
                            <div className="text-center p-12 bg-muted/30 rounded-lg border border-dashed">
                                <p className="text-muted-foreground font-medium">No campaigns found in database.</p>
                                <p className="text-sm mt-1">Create a campaign record via Supabase SQL or the Add button to get started.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* POSTHOG EMBED TAB */}
                <TabsContent value="posthog" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>PostHog Live Dashboard</CardTitle>
                                <CardDescription>Custom Mailmeteor stats embedded directly from PostHog</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a href="https://eu.posthog.com" target="_blank" rel="noreferrer">Open in PostHog ↗</a>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Paste PostHog 'Shared Dashboard' URL here..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={posthogUrl}
                                    onChange={(e) => handleSaveUrl(e.target.value)}
                                />
                            </div>

                            {posthogUrl ? (
                                <div className="w-full h-[800px] border rounded-lg overflow-hidden relative bg-muted/20">
                                    <iframe
                                        src={posthogUrl}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        title="PostHog Embedded Dashboard"
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="w-full aspect-video bg-muted border rounded-lg flex items-center justify-center flex-col">
                                    <Activity className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-bold text-muted-foreground">PostHog Dashboard Not Linked</h3>
                                    <p className="text-sm text-muted-foreground/70 max-w-md text-center mt-2">
                                        To view live PostHog charts here, create a Dashboard in PostHog, click "Share", create a public link, and paste the URL in the box above.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
    );
}
