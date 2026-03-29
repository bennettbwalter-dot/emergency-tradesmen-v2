import { motion } from 'framer-motion';
import { Navigation, Loader2 } from 'lucide-react';

interface ElectricFormationProps {
    onLocate: () => void;
    loading: boolean;
    className?: string;
}

export function ElectricFormation({ onLocate, loading, className = "" }: ElectricFormationProps) {
    return (
        <div className={`relative w-full h-32 flex items-center justify-center overflow-hidden mb-6 ${className}`}>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-20"
            >
                {/* Stable Glowing Circle Container */}
                <div className="relative group">
                    {/* Outer Glow Ring */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gold via-cyan-400 to-gold rounded-xl opacity-50 blur-sm group-hover:opacity-80 group-hover:blur-md transition-all duration-500 animate-spin-slow" />

                    {/* Main Button Container - Rectangular Hero Style */}
                    <div className="relative h-14 min-w-[180px] bg-gradient-to-r from-gold-dark via-gold to-gold-light rounded-xl flex items-center justify-center border border-white/20 shadow-2xl shadow-gold/20 overflow-hidden px-8">

                        {/* Action Button */}
                        <button
                            type="button"
                            onClick={onLocate}
                            disabled={loading}
                            className="relative z-30 flex items-center justify-center w-full h-full gap-2 text-background font-semibold uppercase tracking-wider hover:text-black/80 transition-colors group-active:scale-[0.98] duration-200 text-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Navigation className="w-5 h-5" />
                                    <span>Locate Me</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
