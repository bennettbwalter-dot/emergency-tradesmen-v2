import { Skeleton } from "@/components/ui/skeleton";

export function BusinessCardSkeleton() {
    return (
        <div className="relative w-full max-w-[20rem] sm:max-w-[22rem] mx-auto p-1 sm:p-2 bg-white dark:bg-[#121212] rounded-[2rem] border border-zinc-200 dark:border-white/10 shadow-lg overflow-hidden">
            <div className="relative z-10 flex flex-col gap-3 p-4 pt-5">
                {/* 1. Header Row */}
                <div className="flex items-center justify-between h-9 mb-1">
                    <Skeleton className="h-8 w-24 rounded-r-lg -ml-4" />
                    <Skeleton className="w-9 h-9 rounded-full" />
                </div>

                {/* 2. Category Tag */}
                <div className="flex justify-between items-center h-6">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                {/* 3. Hero Section */}
                <Skeleton className="rounded-xl h-[5.5rem] w-full" />

                {/* 4. Status Grid */}
                <div className="grid grid-cols-2 gap-2 h-10 w-full">
                    <Skeleton className="h-full rounded-full" />
                    <Skeleton className="h-full rounded-full" />
                </div>

                {/* 5. Info Stack */}
                <div className="flex flex-col gap-1.5 w-full">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-11 w-full rounded-full" />
                    ))}
                </div>

                {/* 6. Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-0.5 w-full h-11">
                    <Skeleton className="h-full rounded-lg" />
                    <Skeleton className="h-full rounded-lg" />
                </div>

                {/* 7. Footer Pill */}
                <div className="flex justify-center mt-2 h-7">
                    <Skeleton className="h-7 w-32 rounded-full" />
                </div>
            </div>
        </div>
    );
}
