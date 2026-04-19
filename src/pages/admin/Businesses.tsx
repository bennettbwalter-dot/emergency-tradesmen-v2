import { useEffect, useState, useCallback } from "react";
import { devLog } from "@/lib/devLog";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusinessModal } from "@/components/admin/BusinessModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PAGE_SIZE = 100;

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const { toast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<any>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, name: string } | null>(null);

    const loadBusinesses = useCallback(async (currentPage: number, search: string, tab: 'all' | 'pending') => {
        setIsLoading(true);

        let query = supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

        if (search) {
            query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,trade.ilike.%${search}%`);
        }
        if (tab === 'pending') {
            query = query.eq('claim_status', 'pending');
        }

        const { data: bizData, error, count } = await query;

        const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan, status')
            .eq('status', 'active');

        if (error) {
            console.error('Error loading businesses:', error);
            toast({ title: "Error", description: "Failed to load businesses", variant: "destructive" });
        } else {
            const merged = (bizData || []).map(biz => ({
                ...biz,
                is_premium: subData?.some(s => s.user_id === biz.owner_user_id),
            }));
            setBusinesses(merged);
            setTotalCount(count || 0);
            devLog(`Page ${currentPage + 1}: loaded ${merged.length} of ${count} businesses`);
        }
        setIsLoading(false);
    }, [toast]);

    // Fetch pending count separately (always, regardless of tab/search)
    useEffect(() => {
        supabase
            .from('businesses')
            .select('id', { count: 'exact', head: true })
            .eq('claim_status', 'pending')
            .then(({ count }) => setPendingCount(count || 0));
    }, []);

    // Debounce search: reset to page 0 and reload
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            loadBusinesses(0, searchQuery, activeTab);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery, activeTab, loadBusinesses]);

    // Reload when page changes
    useEffect(() => {
        loadBusinesses(page, searchQuery, activeTab);
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    async function toggleVerified(id: string, currentStatus: boolean) {
        const { error } = await supabase
            .from('businesses')
            .update({ verified: !currentStatus, verified_at: !currentStatus ? new Date().toISOString() : null })
            .eq('id', id);

        if (error) {
            toast({ title: "Error", description: "Failed to update verification status", variant: "destructive" });
        } else {
            loadBusinesses(page, searchQuery, activeTab);
            toast({ title: "Success!", description: !currentStatus ? "Business verified successfully" : "Business unverified" });
        }
    }

    async function approveClaim(business: any) {
        const { error } = await supabase
            .from('businesses')
            .update({ claim_status: 'verified', verified: true, verified_at: new Date().toISOString() })
            .eq('id', business.id);

        if (error) {
            toast({ title: "Error", description: "Failed to approve claim", variant: "destructive" });
        } else {
            toast({ title: "Claim Approved", description: `${business.name} is now owned by the claimant.` });
            loadBusinesses(page, searchQuery, activeTab);
        }
    }

    async function rejectClaim(business: any) {
        if (!confirm(`Reject claim for ${business.name}? This will remove the user as owner.`)) return;
        const { error } = await supabase
            .from('businesses')
            .update({ claim_status: 'unclaimed', owner_id: null, proof_documents: [] })
            .eq('id', business.id);

        if (error) {
            toast({ title: "Error", description: "Failed to reject claim", variant: "destructive" });
        } else {
            toast({ title: "Claim Rejected", description: `Claim for ${business.name} has been removed.` });
            loadBusinesses(page, searchQuery, activeTab);
        }
    }

    async function executeDelete() {
        if (!deleteConfirmation) return;
        const { id, name } = deleteConfirmation;

        const { error, count } = await supabase
            .from('businesses')
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) {
            toast({ title: "Error", description: error.message || "Failed to delete business", variant: "destructive" });
        } else if (count === 0) {
            toast({ title: "Permission Denied", description: "Database refused to delete. Please run the SQL fix.", variant: "destructive" });
        } else {
            loadBusinesses(page, searchQuery, activeTab);
            toast({ title: "Deleted", description: `${name} has been removed` });
        }
        setDeleteConfirmation(null);
    }

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const startItem = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
    const endItem = Math.min((page + 1) * PAGE_SIZE, totalCount);

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display text-foreground mb-2">Business Management</h1>
                    <p className="text-muted-foreground">{totalCount.toLocaleString()} total businesses</p>
                </div>
                <Button variant="hero" size="lg" onClick={() => { setEditingBusiness(null); setIsModalOpen(true); }}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Business
                </Button>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end">
                <div className="flex p-1 bg-secondary rounded-lg self-start">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        All Businesses
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Pending Claims
                        {pendingCount > 0 && (
                            <span className="bg-gold text-black text-[10px] px-1.5 rounded-full font-bold h-4 flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-card rounded-lg border border-border overflow-hidden p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading businesses...</p>
                </div>
            ) : (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Name</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Trade / City</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                                <th className="text-left p-4 font-semibold text-muted-foreground">Verification</th>
                                <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {businesses.map((business) => (
                                <tr key={business.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-foreground">{business.name}</div>
                                        <div className="text-xs text-muted-foreground">{business.phone}</div>
                                        {business.claim_status === 'pending' && (
                                            <div className="text-xs text-gold mt-1 font-medium bg-gold/5 px-2 py-0.5 rounded w-fit">
                                                Claim Requested
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="capitalize">{business.trade}</div>
                                        <div className="text-xs text-muted-foreground">{business.city}</div>
                                    </td>
                                    <td className="p-4">
                                        {business.is_premium ? (
                                            <span className="bg-purple-500/10 text-purple-500 text-[10px] px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase">PRO</span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Free</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {business.claim_status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white" onClick={() => approveClaim(business)}>
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" className="h-7" onClick={() => rejectClaim(business)}>
                                                    <XCircle className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => toggleVerified(business.id, business.verified)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${business.verified ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"}`}
                                            >
                                                {business.verified ? <><CheckCircle className="w-3 h-3" /> Verified</> : <><XCircle className="w-3 h-3" /> Unverified</>}
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <a href={`/admin/profile-editor?id=${business.id}`} title={`Edit ${business.name}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteConfirmation({ id: business.id, name: business.name })}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {businesses.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                <Search className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium">No businesses found</h3>
                            <p className="text-muted-foreground mt-1">
                                {activeTab === 'pending' ? "No pending claims at the moment." : "Try adjusting your search terms."}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                {startItem}–{endItem} of {totalCount.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground px-2">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <BusinessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                business={editingBusiness}
                onSuccess={() => loadBusinesses(page, searchQuery, activeTab)}
            />

            <AlertDialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the business profile for <strong>{deleteConfirmation?.name}</strong> and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700">
                            Delete Business
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
