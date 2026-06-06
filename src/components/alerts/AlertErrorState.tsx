import { AlertTriangle } from "lucide-react";

export function AlertErrorState() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-50/90 p-4 text-amber-950 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-50">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />
        <div>
          <p className="font-black">Some live alerts could not be loaded right now.</p>
          <p className="mt-1 text-sm font-semibold opacity-75">Available official sources are still shown below.</p>
        </div>
      </div>
    </div>
  );
}

