import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Business } from "@/lib/businesses";
import { BusinessModal } from "@/components/admin/BusinessModal";

export default function BusinessesPage() {
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
    const { toast } = useToast();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<any>(null);

    useEffect(() => {
        loadBusinesses();
    }, []);

    async function loadBusinesses() {
        setIsLoading(true);
        // Fetch businesses (increased limit to handle 10K+ businesses)
        const { data: bizData, error, count } = await supabase
            .from('businesses')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(0, 20000); // Fetch up to 20,000 businesses

        // Fetch active subscriptions
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan, status')
            .eq('status', 'active');

        if (error) {
            console.error('Error loading businesses:', error);
            toast({
                title: "Error",
                description: "Failed to load businesses",
                variant: "destructive",
            });
        } else {
            // Merge premium status
            const merged = (bizData || []).map(biz => ({
                ...biz,
                is_premium: subData?.some(s => s.user_id === biz.owner_user_id)
            }));
            setBusinesses(merged);
            console.log(`Loaded ${count} total businesses (showing ${merged.length})`);
        }
        setIsLoading(false);
    }

    async function toggleVerified(id: string, currentStatus: boolean) {
        const { error } = await supabase
            .from('businesses')
            .update({ verified: !currentStatus, verified_at: !currentStatus ? new Date().toISOString() : null })
            .eq('id', id);

        if (error) {
            console.error('Error updating business:', error);
            toast({
                title: "Error",
                description: "Failed to update verification status",
                variant: "destructive",
            });
        } else {
            loadBusinesses();
            toast({
                title: "Success!",
                description: !currentStatus ? "Business verified successfully" : "Business unverified",
            });
        }
    }

    // Approve Claim Function
    async function approveClaim(business: any) {
        const { error } = await supabase
            .from('businesses')
            .update({
                claim_status: 'verified',
                verified: true,
                verified_at: new Date().toISOString()
            })
            .eq('id', business.id);

        if (error) {
            toast({ title: "Error", description: "Failed to approve claim", variant: "destructive" });
        } else {
            toast({ title: "Claim Approved", description: `${business.name} is now owned by the claimant.` });
            loadBusinesses();
        }
    }

    // Reject Claim Function
    async function rejectClaim(business: any) {
        if (!confirm(`Reject claim for ${business.name}? This will remove the user as owner.`)) return;

        const { error } = await supabase
            .from('businesses')
            .update({
                claim_status: 'unclaimed',
                owner_id: null,
                proof_documents: []
            })
            .eq('id', business.id);

        if (error) {
            toast({ title: "Error", description: "Failed to reject claim", variant: "destructive" });
        } else {
            toast({ title: "Claim Rejected", description: `Claim for ${business.name} has been removed.` });
            loadBusinesses();
        }
    }

    async function deleteBusiness(id: string, name: string) {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        const { error } = await supabase
            .from('businesses')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting business:', error);
            toast({
                title: "Error",
                description: "Failed to delete business",
                variant: "destructive",
            });
        } else {
            loadBusinesses();
            toast({
                title: "Deleted",
                description: `${name} has been removed`,
            });
        }
    }

    const handleAddBusiness = () => {
        setEditingBusiness(null);
        setIsModalOpen(true);
    };

    const handleEditBusiness = (business: any) => {
        setEditingBusiness(business);
        setIsModalOpen(true);
    };

    const filteredBusinesses = businesses.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.trade.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'pending') {
            return matchesSearch && b.claim_status === 'pending';
        }
        return matchesSearch;
    });

    const pendingCount = businesses.filter(b => b.claim_status === 'pending').length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display text-foreground mb-2">Business Management</h1>
                    <p className="text-muted-foreground">{businesses.length} total businesses</p>
                </div>
                <Button variant="hero" size="lg" onClick={handleAddBusiness}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Business
                </Button>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end">
                <div className="flex p-1 bg-secondary rounded-lg self-start">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'all'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        All Businesses
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'pending'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
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
                            {filteredBusinesses.map((business) => (
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
                                        <div className="flex items-center gap-2">
                                            {business.is_premium ? (
                                                <span className="bg-purple-500/10 text-purple-500 text-[10px] px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase">PRO</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Free</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {business.claim_status === 'pending' ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    className="h-7 bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => approveClaim(business)}
                                                >
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-7"
                                                    onClick={() => rejectClaim(business)}
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => toggleVerified(business.id, business.verified)}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${business.verified
                                                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                        : "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                                                    }`}
                                            >
                                                {business.verified ? (
                                                    <><CheckCircle className="w-3 h-3" /> Verified</>
                                                ) : (
                                                    <><XCircle className="w-3 h-3" /> Unverified</>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditBusiness(business)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteBusiness(business.id, business.name)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredBusinesses.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                <Search className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium">No businesses found</h3>
                            <p className="text-muted-foreground mt-1">
                                {activeTab === 'pending'
                                    ? "No pending claims at the moment."
                                    : "Try adjusting your search terms."}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Business Modal */}
            <BusinessModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                business={editingBusiness}
                onSuccess={loadBusinesses}
            />
        </div>
    );
}
