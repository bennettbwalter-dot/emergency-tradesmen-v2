import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Outfit', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        'primary-dark': '#15172B', // A deep, rich dark blue/charcoal
        'primary-bg': '#F9FAFB', // Soft off-white for background (Remix)
        'secondary-dark': '#1C1F37', // Slightly lighter for card backgrounds
        'primary-text': '#1F2937', // Deep charcoal for main text
        'accent-teal': '#00D4D2', // Vibrant teal for highlights
        'accent-blue-light': '#667EEA', // Lighter blue for subtle gradients
        'accent-blue-dark': '#5940F7', // Deeper blue for strong accents
        'accent-green': '#2E8B57', // Sea Green (Remix)
        'accent-green-dark': '#256D45', // Darker Sea Green (Remix)
        'text-light': '#E0E7FF', // Light blue-gray for main text
        'text-muted': '#A7B2C5', // Muted gray for secondary text
        'subtle-gray': '#6B7280', // For secondary text (Remix)
        'warning-red': '#F56565', // Soft red for urgency
        'info-yellow': '#ECC94B', // Muted yellow for tips
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        urgent: {
          DEFAULT: "hsl(var(--urgent))",
          foreground: "hsl(var(--urgent-foreground))",
        },
        trust: {
          DEFAULT: "hsl(var(--trust))",
          light: "hsl(var(--trust-light))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'hover-glow': {
          '0%, 100%': { boxShadow: '0 0px 0px rgba(0,0,0,0)' },
          '50%': { boxShadow: '0 5px 15px rgba(0,212,210,0.3)' }, // Teal glow
        },
        'hover-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-gold-text': {
          '0%, 100%': { color: '#ffffff' },
          '50%': { color: 'hsl(var(--gold))' },
        },
        'pulse-red-green-bg': {
          '0%, 100%': { backgroundColor: '#10b981' }, // emarald-500
          '50%': { backgroundColor: '#ef4444' }, // red-500
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'hover-glow': 'hover-glow 0.3s ease-in-out',
        'hover-float': 'hover-float 0.3s ease-in-out',
        'pulse-gold-text': 'pulse-gold-text 2s ease-in-out infinite',
        'pulse-red-green-bg': 'pulse-red-green-bg 2s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;