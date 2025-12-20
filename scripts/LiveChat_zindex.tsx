
import { useState } from "react";
import { EmergencyChatInterface } from "./EmergencyChatInterface";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LiveChat() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-24 right-4 md:right-8 z-[100] w-[90vw] md:w-[400px] h-[600px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Emergency Assistant</h3>
                                    <p className="text-xs text-muted-foreground">Always here to help</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden relative bg-background">
                            <EmergencyChatInterface />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(255,165,0,0.3)] flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-destructive text-destructive-foreground rotate-90' : 'bg-primary text-primary-foreground'
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </motion.button>
        </>
    );
}
