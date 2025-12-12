import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Business } from "@/lib/businesses";

interface BusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    business?: any; // If present, we are editing
    onSuccess: () => void;
}

export function BusinessModal({ isOpen, onClose, business, onSuccess }: BusinessModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        slug: "",
        trade: "plumber",
        city: "",
        address: "",
        postcode: "",
        phone: "",
        email: "",
        website: "",
        hours: "Open 24 hours",
        is_open_24_hours: true,
        is_available_now: true,
    });

    useEffect(() => {
        if (business) {
            setFormData({
                id: business.id || "",
                name: business.name || "",
                slug: business.slug || "",
                trade: business.trade || "plumber",
                city: business.city || "",
                address: business.address || "",
                postcode: business.postcode || "",
                phone: business.phone || "",
                email: business.email || "",
                website: business.website || "",
                hours: business.hours || "Open 24 hours",
                is_open_24_hours: business.is_open_24_hours ?? true,
                is_available_now: business.is_available_now ?? true,
            });
        } else {
            // Reset for new business
            setFormData({
                id: "",
                name: "",
                slug: "",
                trade: "plumber",
                city: "",
                address: "",
                postcode: "",
                phone: "",
                email: "",
                website: "",
                hours: "Open 24 hours",
                is_open_24_hours: true,
                is_available_now: true,
            });
        }
    }, [business, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (business) {
                // Update
                const { error } = await supabase
                    .from('businesses')
                    .update(formData)
                    .eq('id', business.id);

                if (error) throw error;
                toast({ title: "Success", description: "Business updated successfully" });
            } else {
                // Create
                // Auto-generate ID/Slug if needed, but here we let user edit them or generate simple ones
                // Simple ID generation if empty
                const idToUse = formData.id || `${formData.city}-${formData.trade}-${Date.now().toString().slice(-4)}`.toLowerCase().replace(/\s+/g, '-');
                const slugToUse = formData.slug || `${formData.name}-${formData.city}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                const payload = { ...formData, id: idToUse, slug: slugToUse };

                const { error } = await supabase
                    .from('businesses')
                    .insert([payload]);

                if (error) throw error;
                toast({ title: "Success", description: "Business created successfully" });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving business:", error);
            toast({ title: "Error", description: error.message || "Failed to save business", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{business ? "Edit Business" : "Add New Business"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Business Name *</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="id">ID (Optional, auto-generated)</Label>
                            <Input id="id" name="id" value={formData.id} onChange={handleChange} placeholder="e.g. london-plumb-1" disabled={!!business} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug (Optional, auto-generated)</Label>
                            <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. swift-flow-plumbing" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="trade">Trade</Label>
                            <Select value={formData.trade} onValueChange={(val) => handleSelectChange('trade', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select trade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="plumber">Plumber</SelectItem>
                                    <SelectItem value="electrician">Electrician</SelectItem>
                                    <SelectItem value="locksmith">Locksmith</SelectItem>
                                    <SelectItem value="gas-engineer">Gas Engineer</SelectItem>
                                    <SelectItem value="glazier">Glazier</SelectItem>
                                    <SelectItem value="drain-specialist">Drain Specialist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postcode">Postcode</Label>
                            <Input id="postcode" name="postcode" value={formData.postcode} onChange={handleChange} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hours">Hours</Label>
                            <Input id="hours" name="hours" value={formData.hours} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is_open_24_hours"
                            name="is_open_24_hours"
                            checked={formData.is_open_24_hours}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                        <Label htmlFor="is_open_24_hours">Open 24 Hours</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Business"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
