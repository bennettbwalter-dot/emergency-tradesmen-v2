import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { markSubscriptionAsPaid, extendSubscription } from "@/lib/subscriptionService";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface SubscriptionRow {
    id: string;
    user_id: string;
    plan: string;
    status: string;
    subscription_expires_at: string | null;
    created_at: string;
    updated_at: string;
    user_email?: string;
}

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { toast } = useToast();

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        setLoading(true);

        // Get all subscriptions with user info
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            toast({
                title: "Error loading subscriptions",
                description: error.message,
                variant: "destructive"
            });
            setLoading(false);
            return;
        }

        setSubscriptions(data || []);
        setLoading(false);
    };

    const handleMarkAsPaid = async (userId: string, plan: 'professional' | 'enterprise') => {
        const success = await markSubscriptionAsPaid(userId, plan);

        if (success) {
            toast({
                title: "Subscription activated",
                description: `Subscription marked as paid (${plan === 'enterprise' ? '1 year' : '30 days'})`,
            });
            loadSubscriptions();
        } else {
            toast({
                title: "Error",
                description: "Failed to update subscription",
                variant: "destructive"
            });
        }
    };

    const handleExtend = async (userId: string, days: number) => {
        const success = await extendSubscription(userId, days);

        if (success) {
            toast({
                title: "Subscription extended",
                description: `Added ${days} days to subscription`,
            });
            loadSubscriptions();
        } else {
            toast({
                title: "Error",
                description: "Failed to extend subscription",
                variant: "destructive"
            });
        }
    };

    const getStatusBadge = (status: string, expiresAt: string | null) => {
        const isExpired = expiresAt && new Date(expiresAt) < new Date();

        if (isExpired) {
            return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Expired</Badge>;
        }

        switch (status) {
            case 'active':
                return <Badge className="bg-green-500 gap-1"><CheckCircle className="w-3 h-3" /> Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary" className="gap-1">Inactive</Badge>;
            case 'canceled':
                return <Badge variant="outline" className="gap-1">Canceled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const now = new Date();
        const isExpired = date < now;

        return (
            <span className={isExpired ? "text-red-500 font-medium" : ""}>
                {date.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })}
            </span>
        );
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.user_id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Subscriptions</h1>
                    <p className="text-muted-foreground">Manage business subscriptions and payments</p>
                </div>
                <Button onClick={loadSubscriptions} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Last Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Loading subscriptions...
                                </TableCell>
                            </TableRow>
                        ) : filteredSubscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No subscriptions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSubscriptions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-mono text-xs">
                                        {sub.user_id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {sub.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(sub.status, sub.subscription_expires_at)}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(sub.subscription_expires_at)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(sub.updated_at).toLocaleDateString('en-GB')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleMarkAsPaid(sub.user_id, 'professional')}
                                            >
                                                +30 Days
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-emerald-500 hover:bg-emerald-600"
                                                onClick={() => handleMarkAsPaid(sub.user_id, 'enterprise')}
                                            >
                                                +1 Year
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                    <p className="text-2xl font-bold">{subscriptions.length}</p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-500">
                        {subscriptions.filter(s => s.status === 'active').length}
                    </p>
                </div>
                <div className="bg-card border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Expired</p>
                    <p className="text-2xl font-bold text-red-500">
                        {subscriptions.filter(s =>
                            s.subscription_expires_at && new Date(s.subscription_expires_at) < new Date()
                        ).length}
                    </p>
                </div>
            </div>
        </div>
    );
}
