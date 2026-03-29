import { AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { Trade } from "@/lib/trades";

interface TroubleshootingGuideProps {
    trade: Trade;
    city: string;
}

export function TroubleshootingGuide({ trade, city }: TroubleshootingGuideProps) {
    const troubleshootingData: Record<string, { symptom: string; check: string; action: string }[]> = {
        plumber: [
            {
                symptom: "Rapidly rising water or leak",
                check: "Locate your internal stop tap immediately.",
                action: "Turn the tap clockwise to shut off the main water supply."
            },
            {
                symptom: "No hot water but heating works",
                check: "Check the boiler pressure gauge.",
                action: "If below 1 bar, you may need to top up via the filling loop."
            }
        ],
        electrician: [
            {
                symptom: "Sudden partial power loss",
                check: "Look for a tripped switch in your consumer unit.",
                action: "Switch off the likely faulty appliance before resetting."
            },
            {
                symptom: "Burning smell from socket",
                check: "Check for discoloration or heat from the faceplate.",
                action: "DO NOT TOUCH. Turn off the main power and call immediately."
            }
        ],
        locksmith: [
            {
                symptom: "Key turning but lock not opening",
                check: "Check if the latch is moving when you turn.",
                action: "Avoid force. Forcing the key can snap it inside the cylinder."
            },
            {
                symptom: "Door handle feels loose or floppy",
                check: "See if the internal spring has failed.",
                action: "Ensure a secondary lock is used until the gearbox is replaced."
            }
        ],
        "gas-engineer": [
            {
                symptom: "Faint smell of gas",
                check: "Determine if the smell is near the meter or appliance.",
                action: "Extinguish flames, open windows, and turn off the gas at the meter."
            }
        ],
        "drain-specialist": [
            {
                symptom: "Water rising in toilet bowl",
                check: "Check if external manholes are overflowing.",
                action: "Stop using all water outlets to prevent internal flooding."
            }
        ],
        glazier: [
            {
                symptom: "Smashed double glazing",
                check: "Verify if both panes are broken.",
                action: "Avoid touching shards. We provide rapid boarding for security."
            }
        ]
    };

    const tips = troubleshootingData[trade.slug] || troubleshootingData.plumber;

    return (
        <div className="space-y-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                <div>
                    <h2 className="text-3xl font-display text-foreground tracking-tight">Troubleshooting Guide</h2>
                    <p className="text-muted-foreground mt-1 tracking-tight">Immediate steps for {trade.name.toLowerCase()} emergencies in {city}.</p>
                </div>
                <div className="flex items-center gap-2 text-gold bg-gold/5 px-4 py-2 rounded-full border border-gold/20 w-fit">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Safety First</span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {tips.map((tip, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-secondary/30 border border-border/50 hover:border-gold/30 transition-all group">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                                <Lightbulb className="w-5 h-5 text-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-gold transition-colors">{tip.symptom}</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-foreground/40 italic">1</span>
                                </div>
                                <p className="text-sm text-muted-foreground"><span className="text-foreground font-semibold">Check:</span> {tip.check}</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground"><span className="text-foreground font-semibold">Action:</span> {tip.action}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
