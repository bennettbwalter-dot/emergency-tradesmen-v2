import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSimpleTheme } from "@/components/simple-theme"

export function ModeToggle() {
    const { theme, setTheme } = useSimpleTheme()

    return (
        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full border border-gold/50 hover:bg-gold/10" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-[2rem] w-[2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[2rem] w-[2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
