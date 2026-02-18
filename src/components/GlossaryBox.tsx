
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
    className?: string; // Allow external styling
}

export const GlossaryBox: React.FC<GlossaryBoxProps> = ({ title, items, className }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className={cn("my-16 scroll-mt-20", className)} id="glossary">
            <div className="flex items-center gap-3 mb-8 border-b border-gold/20 pb-4">
                <div className="p-2 bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg border border-gold/20 shadow-sm shadow-gold/10">
                    <BookOpen className="w-6 h-6 text-gold" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground m-0 tracking-tight">
                    {title}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                    <Card
                        key={index}
                        className="group relative overflow-hidden bg-secondary/5 border-gold/10 hover:border-gold/30 hover:bg-secondary/10 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 h-full flex flex-col p-6"
                    >
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-bl-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <h3 className="text-lg font-bold text-gold mb-3 font-display relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                            {item.term}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed relative z-10 group-hover:text-foreground/80 transition-colors">
                            {item.definition}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    );
};
