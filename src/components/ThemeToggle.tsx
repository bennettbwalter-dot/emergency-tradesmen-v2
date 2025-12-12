import { Moon, Sun } from "lucide-react";
import { useSimpleTheme } from "@/components/simple-theme";

export function ThemeToggle() {
    const { theme, setTheme } = useSimpleTheme();

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-4 right-4 z-50 p-3 rounded-full bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-lg hover:shadow-xl group"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative w-7 h-7">
                <Sun
                    className={`absolute inset-0 w-7 h-7 text-gold transition-all duration-300 ${theme === "light"
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-90 scale-0 opacity-0"
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-5 h-5 text-gold transition-all duration-300 ${theme === "dark"
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                        }`}
                />
            </div>
            <span className="sr-only">
                {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            </span>
        </button>
    );
}
