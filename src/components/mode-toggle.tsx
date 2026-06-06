import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSimpleTheme } from "@/components/simple-theme"
import { cn } from "@/lib/utils"

export function ModeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useSimpleTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                "h-9 w-9 min-w-9 rounded-full border border-slate-200 p-0 text-slate-500 transition-all duration-200 hover:border-gold/40 hover:bg-gold/5 hover:text-gold dark:border-white/10 dark:text-slate-400 dark:hover:bg-gold/10",
                className,
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
