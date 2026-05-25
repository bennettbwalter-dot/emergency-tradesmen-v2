import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSimpleTheme } from "@/components/simple-theme"

export function ModeToggle() {
    const { theme, setTheme } = useSimpleTheme()

    return (
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-gold/50 hover:bg-gold/5 dark:hover:bg-gold/10 hover:text-gold transition-all duration-200" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
