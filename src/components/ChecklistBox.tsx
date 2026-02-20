
import React from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistBoxProps {
    title: string;
    items: string[];
    className?: string;
}

export const ChecklistBox: React.FC<ChecklistBoxProps> = ({ title, items, className }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className={cn("my-16 scroll-mt-20", className)}>
            <Card className="overflow-hidden border-2 border-gold/30 bg-secondary/40 backdrop-blur-md rounded-[2rem] shadow-2xl shadow-gold/10 relative group transition-all duration-500 hover:border-gold/50">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="p-8 md:p-12 lg:p-16 space-y-8 relative z-10">
                    <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                        <div className="p-3 bg-gold/10 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6 text-gold" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground m-0 tracking-tight">
                            {title}
                        </h2>
                    </div>

                    <ol className="space-y-4 m-0 p-0 list-none">
                        {items.map((item, index) => {
                            // Extract number if it exists at the start of the string (e.g. "1. Item")
                            const match = item.match(/^(\d+)\.\s*(.*)$/);
                            const number = match ? match[1] : (index + 1).toString();
                            const text = match ? match[2] : item;

                            return (
                                <li key={index} className="flex items-start gap-4 group/item">
                                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-2xl bg-gold/10 border border-gold/20 text-gold text-sm font-bold mt-0.5 group-hover/item:bg-gold/20 transition-all duration-300 group-hover/item:scale-110">
                                        {number}
                                    </span>
                                    <p className="text-[16px] md:text-[19px] leading-relaxed m-0 text-foreground/85 pt-1">
                                        {text}
                                    </p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </Card>
        </div>
    );
};
