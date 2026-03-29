
import React from 'react';
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlossaryItem {
    term: string;
    definition: string;
}

interface GlossaryBoxProps {
    title: string;
    items: GlossaryItem[];
    className?: string;
}

export const GlossaryBox: React.FC<GlossaryBoxProps> = ({ title, items, className }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className={cn("my-16 scroll-mt-20", className)} id="glossary">
            <Card className="overflow-hidden border-2 border-gold/30 bg-secondary/40 backdrop-blur-md rounded-[2rem] shadow-2xl shadow-gold/10 relative group transition-all duration-500 hover:border-gold/50">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="p-8 md:p-12 lg:p-16 space-y-8 relative z-10">
                    <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                        <div className="p-3 bg-gold/10 rounded-2xl">
                            <BookOpen className="w-6 h-6 text-gold" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground m-0 tracking-tight">
                            {title}
                        </h2>
                    </div>

                    <ul className="space-y-6 m-0 p-0 list-none">
                        {items.map((item, index) => (
                            <li key={index} className="flex items-start gap-4 group/item">
                                <div className="mt-2.5 w-2 h-2 rounded-full bg-gold/30 flex-shrink-0 group-hover/item:bg-gold transition-all duration-300 scale-100 group-hover/item:scale-125" />
                                <p className="text-[16px] md:text-[19px] leading-relaxed m-0 text-foreground/85">
                                    <strong className="font-bold text-foreground tracking-tight">{item.term}:</strong> <span className="text-foreground/80">{item.definition}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
        </div>
    );
};
