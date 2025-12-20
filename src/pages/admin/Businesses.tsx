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

    const filteredBusinesses = businesses.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.trade.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* Search */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search businesses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary border-b border-border">
                            <tr>
                                <th className="text-left p-4 font-semibold">Name</th>
                                <th className="text-left p-4 font-semibold">Trade</th>
                                <th className="text-left p-4 font-semibold">City</th>
                                <th className="text-left p-4 font-semibold">Rating</th>
                                <th className="text-left p-4 font-semibold">Verified</th>
                                <th className="text-right p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="border-b border-border animate-pulse">
                                    <td className="p-4">
                                        <div className="h-4 bg-secondary rounded w-32 mb-2"></div>
                                        <div className="h-3 bg-secondary rounded w-24"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-4 bg-secondary rounded w-20"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-4 bg-secondary rounded w-24"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-4 bg-secondary rounded w-16"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="h-6 bg-secondary rounded-full w-20"></div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end gap-2">
                                            <div className="h-8 w-8 bg-secondary rounded"></div>
                                            <div className="h-8 w-8 bg-secondary rounded"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary border-b border-border">
                            <tr>
                                <th className="text-left p-4 font-semibold">Name</th>
                                <th className="text-left p-4 font-semibold">Trade</th>
                                <th className="text-left p-4 font-semibold">City</th>
                                <th className="text-left p-4 font-semibold">Rating</th>
                                <th className="text-left p-4 font-semibold">Verified</th>
                                <th className="text-right p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBusinesses.map((business) => (
                                <tr key={business.id} className="border-b border-border hover:bg-secondary/50">
                                    <td className="p-4">
                                        <div className="flex items-start gap-2">
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {business.name}
                                                    {business.is_premium && (
                                                        <span className="bg-gold/10 text-gold text-[10px] px-1.5 py-0.5 rounded border border-gold/20 font-bold uppercase">
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{business.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 capitalize">{business.trade}</td>
                                    <td className="p-4">{business.city}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1">
                                            <span className="font-semibold">{Number(business.rating).toFixed(1)}</span>
                                            <span className="text-sm text-muted-foreground">({business.review_count})</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleVerified(business.id, business.verified)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${business.verified
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-gray-500/10 text-gray-500"
                                                }`}
                                        >
                                            {business.verified ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verified
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3" />
                                                    Unverified
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEditBusiness(business)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteBusiness(business.id, business.name)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredBusinesses.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No businesses found
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
