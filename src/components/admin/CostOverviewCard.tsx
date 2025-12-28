import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { usageLogger } from "@/lib/usage-logger";
import { DollarSign, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

// Types matching usage-logger.ts
interface UsageLog {
    service_id: string;
    current_usage: number;
    month_year: string;
}

export function CostOverviewCard() {
    const [usageData, setUsageData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const LIMITS = {
        google_map_loads: { limit: 10000, label: "Google Maps (Loads)" },
        google_route_requests: { limit: 10000, label: "Google Routes" },
        azure_tts_chars: { limit: 500000, label: "Azure Neural Voice (Characters)" }
    };

    useEffect(() => {
        const fetchUsage = async () => {
            const data = await usageLogger.getCurrentMonthUsage();
            const usageMap: Record<string, number> = {};

            // Default 0 for all
            Object.keys(LIMITS).forEach(key => usageMap[key] = 0);

            data.forEach((log: any) => {
                usageMap[log.service_id] = log.current_usage;
            });
            setUsageData(usageMap);
            setLoading(false);
        };
        fetchUsage();
    }, []);

    const getStatusColor = (current: number, limit: number) => {
        const percentage = (current / limit) * 100;
        if (percentage >= 100) return "bg-red-500"; // Critical
        if (percentage >= 80) return "bg-yellow-500"; // Warning
        return "bg-green-500"; // Safe
    };

    const getStatusIcon = (current: number, limit: number) => {
        const percentage = (current / limit) * 100;
        if (percentage >= 100) return <AlertCircle className="w-4 h-4 text-red-500" />;
        if (percentage >= 80) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    };

    if (loading) return <div className="h-40 bg-secondary/50 animate-pulse rounded-xl" />;

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-gold" />
                        Monthly API Costs (Estimates)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Based on Free Tier Quotas</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Cloudflare Unmetered
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(LIMITS).map(([key, config]) => {
                    const current = usageData[key] || 0;
                    const limit = config.limit;
                    const percentage = Math.min((current / limit) * 100, 100);

                    return (
                        <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-foreground/80 flex items-center gap-2">
                                    {getStatusIcon(current, limit)}
                                    {config.label}
                                </span>
                                <span className="text-muted-foreground">
                                    {current.toLocaleString()} / {limit.toLocaleString()}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${getStatusColor(current, limit)}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
