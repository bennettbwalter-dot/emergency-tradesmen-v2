import { Skeleton } from "@/components/ui/skeleton";

export function BusinessCardSkeleton() {
    return (
        <div className="bg-card rounded-xl border border-border/50 p-6 space-y-4">
            {/* Header with badge */}
            <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            {/* Business name */}
            <Skeleton className="h-8 w-3/4" />

            {/* Rating and reviews */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
            </div>

            {/* Location and hours */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>

            {/* Services/badges */}
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}
