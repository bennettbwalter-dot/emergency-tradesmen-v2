import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon: LucideIcon;
    iconColor?: string;
    trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({
    title,
    value,
    change,
    changeLabel,
    icon: Icon,
    iconColor = "text-gold",
    trend = 'neutral'
}: MetricCardProps) {
    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold mt-2">{value}</h3>
                    {change !== undefined && (
                        <p className={cn("text-sm mt-2", trendColor)}>
                            <span className="font-semibold">
                                {change > 0 ? '+' : ''}{change}
                            </span>
                            {changeLabel && <span className="ml-1">{changeLabel}</span>}
                        </p>
                    )}
                </div>
                <div className={cn("p-3 rounded-full bg-secondary", iconColor)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </Card>
    );
}
