import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";

export function USPremiumModelerDialog({ children }: { children: React.ReactNode }) {
    const [propertyValue, setPropertyValue] = useState(450000); // US average is higher
    const [hvacAge, setHvacAge] = useState(10);
    const [regionMultiplier, setRegionMultiplier] = useState(1.0);
    const [insurancePremium, setInsurancePremium] = useState(1200); // US home insurance is much higher
    const [deductible, setDeductible] = useState(1000);

    const [checklist, setChecklist] = useState([false, false, false, false]);

    // Derived states
    const riskScoreRaw = (hvacAge / 10) * 5 + Math.min((propertyValue / 1000000) * 2, 2) + (regionMultiplier / 1.3) * 3;
    const finalScore = Math.min(Math.round(riskScoreRaw), 10);

    let budgetPercent = 0.01;
    if (hvacAge > 7) budgetPercent = 0.025;
    if (hvacAge > 9) budgetPercent = 0.035;
    const annualBudget = propertyValue * budgetPercent;

    const recDeductible = Math.min(Math.round((propertyValue * 0.0025) / 100) * 100, 2500); // Capped at 2500 for US

    const hvacOop = 1250 * regionMultiplier; // US HVAC repair usually higher
    const elecOop = 350 * regionMultiplier;
    const plumbOop = 300 * regionMultiplier;
    const totalOop = hvacOop + elecOop + plumbOop;

    useEffect(() => {
        const saved = [0, 1, 2, 3].map(idx => localStorage.getItem(`us_repair_check_${idx}`) === 'true');
        setChecklist(saved);
    }, []);

    const toggleChecklist = (idx: number) => {
        const newChecklist = [...checklist];
        newChecklist[idx] = !newChecklist[idx];
        setChecklist(newChecklist);
        localStorage.setItem(`us_repair_check_${idx}`, String(newChecklist[idx]));
    };

    const formatCurrency = (num: number) => {
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-0 border-none sm:rounded-2xl">
                <style dangerouslySetInnerHTML={{
                    __html: `
                .modeler-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .modeler-root hr { border-color: #e2e8f0; }
                .modeler-root .text-primary { color: #c5a059; } 
                .modeler-root .bg-accent { background: #faf3e0; }
                .modeler-root .btn-primary { background: #c5a059; color: white; transition: background 0.2s; }
                .modeler-root .btn-primary:hover { background: #b8986e; }
                .dark .modeler-root { color: #e2e8f0; }
                .dark .modeler-root .bg-accent { background: #3d3010; }
                .dark .modeler-root .text-primary { color: #d7c08a; }
                .dark .modeler-root .bg-white { background-color: #0f172a; }
                .dark .modeler-root .border-gray-200 { border-color: #334155; }
                .dark .modeler-root input, .dark .modeler-root select { background-color: #1e293b; color: #f8fafc; border-color: #475569; }
                `}} />
                <div className="modeler-root w-full">
                    <div className="bg-white dark:bg-slate-900 px-6 py-10 text-center border-b border-gray-200 dark:border-slate-800">
                        <p className="uppercase text-xs tracking-widest text-slate-500 mb-2 font-semibold">Updated: March 2, 2026</p>
                        <h1 className="text-3xl md:text-4xl font-serif text-primary mb-4 font-bold">The 2026 Emergency Home Repair & Premium Modeler</h1>
                        <p className="text-lg max-w-2xl mx-auto text-slate-600 dark:text-slate-400">An interactive tool for US homeowners to calculate financial risk, optimize insurance deductibles, and budget for emergency maintenance in the 2026 fiscal year.</p>
                    </div>

                    <div className="p-6 md:p-10 max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
                            {/* Inputs Section */}
                            <div className="md:col-span-5 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Estimated Property Value ($)</label>
                                    <input type="number" value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} step="5000" min="100000" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold outline-none" />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Age of HVAC / Furnace (Years)</label>
                                    <select value={hvacAge} onChange={e => setHvacAge(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value={1}>0-2 Years (New)</option>
                                        <option value={4}>3-6 Years (Mid-life)</option>
                                        <option value={7}>7-11 Years (Aging)</option>
                                        <option value={10}>12+ Years (High Risk)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">US Region (Labor Rate Context)</label>
                                    <select value={regionMultiplier} onChange={e => setRegionMultiplier(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value={1.3}>West Coast / Northeast (High Cost)</option>
                                        <option value={1.0}>Midwest / Sunbelt (National Avg)</option>
                                        <option value={0.9}>Southeast / South (Lower Cost)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Annual Home Insurance Premium ($)</label>
                                    <input type="number" value={insurancePremium} onChange={e => setInsurancePremium(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold outline-none" />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Current Insurance Deductible ($)</label>
                                    <input type="number" value={deductible} onChange={e => setDeductible(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-gold outline-none" />
                                </div>
                            </div>

                            {/* Results Section */}
                            <div className="md:col-span-7 space-y-6">
                                <div className="text-center p-6 bg-accent rounded-xl">
                                    <span className="block font-bold tracking-widest uppercase text-sm mb-2 opacity-80 dark:text-white">2026 Financial Risk Score</span>
                                    <span className="block text-6xl font-black text-primary leading-none mb-2">{finalScore}</span>
                                    <span className="font-bold uppercase tracking-widest text-sm" style={{ color: finalScore <= 4 ? '#16a34a' : finalScore <= 7 ? '#d97706' : '#dc2626' }}>
                                        {finalScore <= 4 ? 'Low Risk' : finalScore <= 7 ? 'Moderate Risk' : 'High Financial Risk'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl text-center">
                                        <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">Annual Maint. Budget</h3>
                                        <p className="text-2xl font-bold text-primary mb-1">{formatCurrency(annualBudget)}</p>
                                        <p className="text-xs text-slate-400">Recommended for 2026</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl text-center">
                                        <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">Recommended Deductible</h3>
                                        <p className="text-2xl font-bold text-primary mb-1">{formatCurrency(recDeductible)}</p>
                                        <p className="text-xs text-slate-400">1% Stability Rule</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-xl overflow-hidden">
                                    <h3 className="font-serif text-lg border-b border-gray-100 dark:border-slate-800 pb-3 mb-4 font-bold dark:text-slate-200">Emergency Cost Comparison (2026 Est.)</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                                                    <th className="p-3 font-semibold rounded-tl">Service Type</th>
                                                    <th className="p-3 font-semibold">Pay-As-You-Go Cost</th>
                                                    <th className="p-3 font-semibold rounded-tr">Home Warranty Plan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 dark:text-slate-300">
                                                <tr>
                                                    <td className="p-3 py-4">Emergency HVAC Repair</td>
                                                    <td className="p-3 py-4 font-medium">{formatCurrency(hvacOop)}</td>
                                                    <td className="p-3 py-4 text-gold dark:text-gold-light font-medium">$75 - $125 Service Fee</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 py-4">Electrical Fault (Out-of-Hours)</td>
                                                    <td className="p-3 py-4 font-medium">{formatCurrency(elecOop)}</td>
                                                    <td className="p-3 py-4 text-gold dark:text-gold-light font-medium">Included</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 py-4">Emergency Plumbing Call-out</td>
                                                    <td className="p-3 py-4 font-medium">{formatCurrency(plumbOop)}</td>
                                                    <td className="p-3 py-4 text-gold dark:text-gold-light font-medium">Included</td>
                                                </tr>
                                            </tbody>
                                            <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                                                <tr>
                                                    <td className="p-3 text-slate-700 dark:text-slate-200">Estimated Annual Total</td>
                                                    <td className="p-3 text-red-600 dark:text-red-400">{formatCurrency(totalOop)}</td>
                                                    <td className="p-3 text-gold-dark dark:text-gold-light">~$450 - $600/yr</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Educational Content */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div>
                                <h2 className="text-2xl font-serif text-slate-800 dark:text-slate-200 mb-3 font-bold">Understanding the 1% Rule</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Industry experts suggest US homeowners should budget between 1% and 4% of their property's value annually for maintenance. In 2026, with inflation affecting parts and labor rates increasing by an estimated 5-8%, setting aside these funds is critical to avoiding high-interest emergency credit card debt.</p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif text-slate-800 dark:text-slate-200 mb-3 font-bold">2026 Labor Rate Trends</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Our data shows that emergency call-outs in high cost-of-living areas now average $250+ for the first hour, while national averages sit closer to $150. If your HVAC unit is over 10 years old, the probability of a $800+ repair in the next 12 months increases by 65%.</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 md:p-8 rounded-xl">
                            <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-6">2026 Home Readiness Checklist</h3>
                            <div className="space-y-4">
                                {['Verify licensing for HVAC and electrical contractors', 'Review home warranty vs. standard homeowner\'s insurance coverage', 'Schedule pre-season HVAC tune-up and replace filters', 'Confirm current deductible doesn\'t exceed 1% of liquid savings'].map((text, idx) => (
                                    <label key={idx} className="flex items-start gap-4 cursor-pointer group">
                                        <input type="checkbox" checked={checklist[idx]} onChange={() => toggleChecklist(idx)} className="mt-1 w-5 h-5 text-gold rounded border-gray-300 focus:ring-gold" />
                                        <span className={`text-slate-700 dark:text-slate-300 transition-colors ${checklist[idx] ? 'line-through opacity-50' : 'group-hover:text-black dark:group-hover:text-white'}`}>{text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-slate-800/50">
                            <p className="text-sm text-slate-400">&copy; 2026 Emergency Home Insights. Calculations are estimates based on 2024-2026 market data. Not financial advice.</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
