import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { db } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Eye, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Quote {
    id: string;
    business_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    details: string;
    urgency: string;
    status: string;
    created_at: string;
}

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const { toast } = useToast();

    const loadQuotes = async () => {
        setLoading(true);
        try {
            const data = await db.quotes.getAll();
            setQuotes(data || []);
        } catch (error) {
            console.error("Error loading quotes:", error);
            toast({
                title: "Error",
                description: "Failed to load quotes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuotes();
    }, []);

    const handleStatusChange = async (quoteId: string, newStatus: string) => {
        try {
            await db.quotes.updateStatus(quoteId, newStatus);
            setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: newStatus } : q));
            toast({
                title: "Status Updated",
                description: `Quote marked as ${newStatus}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (quoteId: string) => {
        try {
            await db.quotes.delete(quoteId);
            setQuotes(quotes.filter(q => q.id !== quoteId));
            toast({
                title: "Quote Deleted",
                description: "The quote request has been removed",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete quote",
                variant: "destructive",
            });
        }
    };

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch =
            quote.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.details?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || quote.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case "viewed":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30"><Eye className="w-3 h-3 mr-1" />Viewed</Badge>;
            case "accepted":
                return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
            case "rejected":
                return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case "Emergency":
            case "emergency":
                return <Badge className="bg-red-500">🚨 Emergency</Badge>;
            case "Standard":
            case "today":
                return <Badge className="bg-blue-500">⚡ Standard</Badge>;
            case "Flexible":
            case "flexible":
            case "this-week":
                return <Badge className="bg-gray-500">🕐 Flexible</Badge>;
            default:
                return <Badge variant="outline">{urgency}</Badge>;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Quote Requests</h1>
                    <p className="text-muted-foreground">Manage incoming quote requests from customers</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or details..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="viewed">Viewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                        <p className="text-2xl font-bold">{quotes.length}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-yellow-500">{quotes.filter(q => q.status === 'pending').length}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Accepted</p>
                        <p className="text-2xl font-bold text-green-500">{quotes.filter(q => q.status === 'accepted').length}</p>
                    </div>
                    <div className="bg-card p-4 rounded-lg border">
                        <p className="text-sm text-muted-foreground">Emergency</p>
                        <p className="text-2xl font-bold text-red-500">{quotes.filter(q => q.urgency === 'Emergency' || q.urgency === 'emergency').length}</p>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    </div>
                ) : filteredQuotes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        {quotes.length === 0 ? "No quote requests yet" : "No quotes match your filters"}
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Urgency</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQuotes.map((quote) => (
                                    <TableRow key={quote.id}>
                                        <TableCell className="font-medium">{quote.customer_name}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{quote.customer_email}</div>
                                                <div className="text-muted-foreground">{quote.customer_phone}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{quote.details}</TableCell>
                                        <TableCell>{getUrgencyBadge(quote.urgency)}</TableCell>
                                        <TableCell>
                                            <Select
                                                value={quote.status}
                                                onValueChange={(value) => handleStatusChange(quote.id, value)}
                                            >
                                                <SelectTrigger className="w-[130px]">
                                                    {getStatusBadge(quote.status)}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="viewed">Viewed</SelectItem>
                                                    <SelectItem value="accepted">Accepted</SelectItem>
                                                    <SelectItem value="rejected">Rejected</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(quote.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Quote Request?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete this quote request from {quote.customer_name}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(quote.id)}
                                                            className="bg-destructive text-destructive-foreground"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
