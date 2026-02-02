import { useEffect, useState } from "react";
import { fetchAllBusinesses } from "@/lib/businessService";
import type { Business } from "@/lib/businesses";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DataExportPage() {
    const { toast } = useToast();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Fetch up to 1000 real businesses for export
                const data = await fetchAllBusinesses(1000);
                setBusinesses(data);
            } catch (error) {
                console.error("Failed to load businesses:", error);
                toast({
                    title: "Error",
                    description: "Failed to load real business data.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [toast]);

    const copyToClipboard = () => {
        if (businesses.length === 0) return;

        // Create TSV header
        const headers = ["Email", "Company Name", "Phone", "Service Area", "Contact Name", "Trade", "Website", "Country"];

        // Create TSV rows
        const rows = businesses.map(b => [
            b.email || "",
            b.name || "",
            b.phone ? `'${b.phone}` : "", // Prepend ' to force Excel to treat as text
            b.city || b.address || "",
            "", // Contact Name placeholder
            b.trade || "",
            b.website || "",
            b.country_code || "GB"
        ].join("\t"));

        const tsvContent = [headers.join("\t"), ...rows].join("\n");

        navigator.clipboard.writeText(tsvContent).then(() => {
            toast({
                title: "Copied to clipboard",
                description: `${businesses.length} real records ready to paste into Excel/Sheets`,
            });
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading verified business data from Supabase...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Export Tool</h1>
                    <p className="text-muted-foreground mt-2">
                        Internal tool to extract REAL business contact details from Supabase.
                        Found {businesses.length} verified records.
                    </p>
                </div>
                <Button onClick={copyToClipboard} className="gap-2" disabled={businesses.length === 0}>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard (Excel/CSV)
                </Button>
            </div>

            <div className="border rounded-md shadow-sm overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium text-gray-700 min-w-[200px]">Email</th>
                                <th className="px-4 py-3 font-medium text-gray-700 min-w-[200px]">Company Name</th>
                                <th className="px-4 py-3 font-medium text-gray-700 min-w-[120px]">Phone</th>
                                <th className="px-4 py-3 font-medium text-gray-700">Service Area</th>
                                <th className="px-4 py-3 font-medium text-gray-700 min-w-[100px]">Trade</th>
                                <th className="px-4 py-3 font-medium text-gray-700 min-w-[200px]">Website</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {businesses.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50 font-mono text-xs">
                                    <td className="px-4 py-2 text-blue-600 break-all">{b.email || "-"}</td>
                                    <td className="px-4 py-2 font-semibold text-gray-900">{b.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-900">{b.phone || "-"}</td>
                                    <td className="px-4 py-2 capitalize text-gray-900">{b.city || "-"}</td>
                                    <td className="px-4 py-2 capitalize font-medium text-gray-900">{b.trade || "-"}</td>
                                    <td className="px-4 py-2 text-blue-600 break-all">
                                        {b.website ? (
                                            <a href={b.website} target="_blank" rel="noreferrer" className="hover:underline">
                                                {b.website}
                                            </a>
                                        ) : "-"}
                                    </td>
                                </tr>
                            ))}
                            {businesses.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                                        No real verified businesses found in Supabase.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
