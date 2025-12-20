import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: any;
    onSuccess: () => void;
}

export function VerificationModal({ isOpen, onClose, business, onSuccess }: VerificationModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const { toast } = useToast();

    if (!business) return null;

    const documents = business.proof_documents || [];

    // Safety check for older records or different schema
    const docList = Array.isArray(documents) ? documents : [];

    const sendEmail = async (to: string, subject: string, html: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: { to, subject, html },
            });
            if (error) throw error;
            console.log('Email sent:', data);
        } catch (err) {
            console.error('Failed to send email:', err);
            toast({
                title: "Email Error",
                description: "Failed to send notification email, but status was updated.",
                variant: "destructive",
            });
        }
    };

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('businesses')
                .update({
                    verified: true,
                    claim_status: 'verified',
                    verified_at: new Date().toISOString()
                })
                .eq('id', business.id);

            if (error) throw error;

            // Send Approval Email
            if (business.email) {
                await sendEmail(
                    business.email,
                    `Your Business Claim for ${business.name} is Approved`,
                    `<p>Hi there,</p><p>Great news! Your claim for <strong>${business.name}</strong> has been verified.</p><p>You now have full access to manage your business profile.</p>`
                );
            }

            toast({
                title: "Business Verified",
                description: `${business.name} has been approved.`,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error approving business:', error);
            toast({
                title: "Error",
                description: "Failed to approve business.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        setIsLoading(true);
        try {
            // In a real app, we might store the rejection reason or email the user
            const { error } = await supabase
                .from('businesses')
                .update({
                    verified: false,
                    claim_status: 'rejected',
                    verified_at: null
                })
                .eq('id', business.id);

            if (error) throw error;

            // Send Rejection Email
            if (business.email) {
                await sendEmail(
                    business.email,
                    `Update on your Business Claim for ${business.name}`,
                    `<p>Hi there,</p><p>Unfortunately, we could not verify your claim for <strong>${business.name}</strong> at this time.</p><p><strong>Reason:</strong> ${rejectReason || 'Documents provided were insufficient.'}</p><p>Please review your details and try again.</p>`
                );
            }

            toast({
                title: "Claim Rejected",
                description: `${business.name} claim has been rejected.`,
            });
            onSuccess();
            onClose();
            setShowRejectInput(false);
            setRejectReason("");
        } catch (error: any) {
            console.error('Error rejecting business:', error);
            toast({
                title: "Error",
                description: "Failed to reject claim.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getPublicUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        const { data } = supabase.storage.from('business-claims').getPublicUrl(path);
        return data.publicUrl;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review Business Claim</DialogTitle>
                    <DialogDescription>
                        Verify details provided by the claimant for <strong>{business.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Business Details */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Claimant Details</h3>
                        <div className="grid gap-2 text-sm">
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground font-medium">Name:</span>
                                <span className="col-span-2">{business.name}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground font-medium">Trade:</span>
                                <span className="col-span-2 capitalize">{business.trade}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground font-medium">City:</span>
                                <span className="col-span-2">{business.city}</span>
                            </div>
                            {/* Assuming we might fetch user email/phone from join if needed, but using business fields for now */}
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground font-medium">Email:</span>
                                <span className="col-span-2 break-all">{business.email || "N/A"}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-muted-foreground font-medium">Phone:</span>
                                <span className="col-span-2">{business.phone || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">Verification Documents</h3>
                        {docList.length === 0 ? (
                            <div className="text-muted-foreground text-sm italic py-4">
                                No documents uploaded.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {docList.map((doc: string, index: number) => {
                                    const url = getPublicUrl(doc);
                                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(doc);

                                    return (
                                        <div key={index} className="border rounded-lg p-3 bg-secondary/20">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium truncate max-w-[200px]">Document {index + 1}</span>
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs flex items-center gap-1 text-blue-500 hover:underline"
                                                >
                                                    Open <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                            {isImage ? (
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-muted rounded overflow-hidden hover:opacity-90 transition-opacity">
                                                    <img src={url} alt={`Document ${index + 1}`} className="w-full h-full object-cover" />
                                                </a>
                                            ) : (
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center aspect-video bg-muted rounded border-2 border-dashed hover:bg-muted/80 transition-colors">
                                                    <div className="text-center">
                                                        <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                                                        <span className="text-xs text-muted-foreground">View File</span>
                                                    </div>
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {showRejectInput && (
                    <div className="pt-4 border-t animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="reject-reason">Reason for Rejection (Optional)</Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="e.g. Documents provided do not match business details..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="mt-2"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowRejectInput(false)}>Cancel</Button>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {!showRejectInput && (
                        <>
                            <Button variant="outline" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Reject Claim
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Approve & Verify
                            </Button>
                        </>
                    )}
                    {showRejectInput && (
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rejection"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
