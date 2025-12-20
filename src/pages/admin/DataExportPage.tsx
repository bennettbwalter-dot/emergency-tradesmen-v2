import { businessListings } from "@/lib/businesses";
import { Button } from "@/components/ui/button";
import { Copy, Table } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DataExportPage() {
    const { toast } = useToast();

    // Flatten data: Trade -> City -> Businesses
    const allBusinesses = Object.entries(businessListings).flatMap(([city, tradeMap]) =>
        Object.entries(tradeMap).flatMap(([trade, businesses]) =>
            businesses.map(b => ({
                ...b,
                cityName: city,
                tradeName: trade
            }))
        )
    );

    // Filter out duplicates if any (based on ID)
    const uniqueBusinesses = Array.from(new Map(allBusinesses.map(item => [item.id, item])).values());

    const copyToClipboard = () => {
        // Create TSV header
        const headers = ["Email", "Company Name", "Phone", "Service Area", "Contact Name", "Trade", "Website"];

        // Create TSV rows
        const rows = uniqueBusinesses.map(b => [
            b.email || "",
            b.name,
            b.phone ? `'${b.phone}` : "", // Prepend ' to force Excel to treat as text
            b.cityName,
            "", // Contact Name not available in data yet
            b.tradeName,
            b.website || ""
        ].join("\t"));

        const tsvContent = [headers.join("\t"), ...rows].join("\n");

        navigator.clipboard.writeText(tsvContent).then(() => {
            toast({
                title: "Copied to clipboard",
                description: `${uniqueBusinesses.length} records ready to paste into Excel/Sheets`,
            });
        });
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Export Tool</h1>
                    <p className="text-muted-foreground mt-2">
                        Internal tool to extract business contact details.
                        Found {uniqueBusinesses.length} records.
                    </p>
                </div>
                <Button onClick={copyToClipboard} className="gap-2">
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
                                <th className="px-4 py-3 font-medium text-gray-700 text-gray-400">Contact Name</th>
                                <th className="px-4 py-3 font-medium text-gray-700 min-w-[100px]">Trade</th>
                                <th className="px-4 py-3 font-medium text-gray-700 min-w-[200px]">Website</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {uniqueBusinesses.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50 font-mono text-xs">
                                    <td className="px-4 py-2 text-blue-600 break-all">{b.email || "-"}</td>
                                    <td className="px-4 py-2 font-semibold text-gray-900">{b.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-gray-900">{b.phone || "-"}</td>
                                    <td className="px-4 py-2 capitalize text-gray-900">{b.cityName}</td>
                                    <td className="px-4 py-2 text-gray-400 italic">Not available</td>
                                    <td className="px-4 py-2 capitalize font-medium text-gray-900">{b.tradeName}</td>
                                    <td className="px-4 py-2 text-blue-600 break-all">
                                        {b.website ? (
                                            <a href={b.website} target="_blank" rel="noreferrer" className="hover:underline">
                                                {b.website}
                                            </a>
                                        ) : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
