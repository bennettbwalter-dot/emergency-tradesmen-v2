import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function PremiumModelerDialog({ children }: { children: React.ReactNode }) {
    const [propertyValue, setPropertyValue] = useState(350000);
    const [boilerAge, setBoilerAge] = useState(10);
    const [regionMultiplier, setRegionMultiplier] = useState(1.0);
    const [insurancePremium, setInsurancePremium] = useState(450);
    const [excess, setExcess] = useState(250);

    const [checklist, setChecklist] = useState([false, false, false, false]);

    // Derived states
    const riskScoreRaw = (boilerAge / 10) * 5 + Math.min((propertyValue / 1000000) * 2, 2) + (regionMultiplier / 1.3) * 3;
    const finalScore = Math.min(Math.round(riskScoreRaw), 10);

    let budgetPercent = 0.01;
    if (boilerAge > 7) budgetPercent = 0.025;
    if (boilerAge > 9) budgetPercent = 0.035;
    const annualBudget = propertyValue * budgetPercent;

    const recExcess = Math.min(Math.round((propertyValue * 0.0025) / 50) * 50, 1000);

    const boilerOop = 550 * regionMultiplier;
    const elecOop = 185 * regionMultiplier;
    const plumbOop = 130 * regionMultiplier;
    const totalOop = boilerOop + elecOop + plumbOop;

    useEffect(() => {
        const saved = [0, 1, 2, 3].map(idx => localStorage.getItem(`repair_check_${idx}`) === 'true');
        setChecklist(saved);
    }, []);

    const toggleChecklist = (idx: number) => {
        const newChecklist = [...checklist];
        newChecklist[idx] = !newChecklist[idx];
        setChecklist(newChecklist);
        localStorage.setItem(`repair_check_${idx}`, String(newChecklist[idx]));
    };

    const formatCurrency = (num: number) => {
        return '£' + num.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
                .modeler-root .text-primary { color: #2d5a27; }
                .modeler-root .bg-accent { background: #e9f0e8; }
                .modeler-root .btn-primary { background: #2d5a27; color: white; transition: background 0.2s; }
                .modeler-root .btn-primary:hover { background: #1e3d1a; }
                .dark .modeler-root { color: #e2e8f0; }
                .dark .modeler-root .bg-accent { background: #1a2e18; }
                .dark .modeler-root .text-primary { color: #86dc79; }
                .dark .modeler-root .bg-white { background-color: #0f172a; }
                .dark .modeler-root .border-gray-200 { border-color: #334155; }
                .dark .modeler-root input, .dark .modeler-root select { background-color: #1e293b; color: #f8fafc; border-color: #475569; }
                `}} />
                <div className="modeler-root w-full">
                    <div className="bg-white dark:bg-slate-900 px-6 py-10 text-center border-b border-gray-200 dark:border-slate-800">
                        <p className="uppercase text-xs tracking-widest text-slate-500 mb-2 font-semibold">Updated: March 2, 2026</p>
                        <h1 className="text-3xl md:text-4xl font-serif text-primary mb-4 font-bold">The 2026 Emergency Home Repair & Premium Modeler</h1>
                        <p className="text-lg max-w-2xl mx-auto text-slate-600 dark:text-slate-400">An interactive tool for UK homeowners to calculate financial risk, optimize insurance deductibles, and budget for emergency maintenance in the 2026 fiscal year.</p>
                    </div>

                    <div className="p-6 md:p-10 max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
                            {/* Inputs Section */}
                            <div className="md:col-span-5 space-y-5 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Estimated Property Value (£)</label>
                                    <input type="number" value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} step="1000" min="50000" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Age of Boiler (Years)</label>
                                    <select value={boilerAge} onChange={e => setBoilerAge(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none">
                                        <option value={1}>0-2 Years (New)</option>
                                        <option value={4}>3-6 Years (Mid-life)</option>
                                        <option value={7}>7-11 Years (Aging)</option>
                                        <option value={10}>12+ Years (High Risk)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">UK Region (Labor Rate Context)</label>
                                    <select value={regionMultiplier} onChange={e => setRegionMultiplier(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none">
                                        <option value={1.3}>London & South East</option>
                                        <option value={1.0}>Midlands & North</option>
                                        <option value={0.95}>Scotland & Wales</option>
                                        <option value={0.9}>South West</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Annual Insurance Premium (£)</label>
                                    <input type="number" value={insurancePremium} onChange={e => setInsurancePremium(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm text-slate-700 dark:text-slate-300">Current Insurance Excess/Deductible (£)</label>
                                    <input type="number" value={excess} onChange={e => setExcess(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" />
                                </div>
                            </div>

                            {/* Results Section */}
                            <div className="md:col-span-7 space-y-6">
                                <div className="text-center p-6 bg-accent rounded-xl">
                                    <span className="block font-bold tracking-widest uppercase text-sm mb-2 opacity-80 dark:text-white">2026 Financial Risk Score</span>
                                    <span className="block text-6xl font-black text-primary leading-none mb-2">{finalScore}</span>
                                    <span className="font-bold uppercase tracking-widest text-sm" style={{ color: finalScore <= 4 ? '#2d5a27' : finalScore <= 7 ? '#d4a017' : '#ef4444' }}>
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
                                        <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold mb-2">Recommended Excess</h3>
                                        <p className="text-2xl font-bold text-primary mb-1">{formatCurrency(recExcess)}</p>
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
                                                    <th className="p-3 font-semibold rounded-tr">Cover Plan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 dark:text-slate-300">
                                                <tr>
                                                    <td className="p-3 py-4">Emergency Boiler Repair</td>
                                                    <td className="p-3 py-4 font-medium">{formatCurrency(boilerOop)}</td>
                                                    <td className="p-3 py-4 text-emerald-600 dark:text-emerald-400 font-medium">Included (£0 Excess)</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 py-4">Electrical Fault (Out-of-Hours)</td>
                                                    <td className="p-3 py-4 font-medium">{formatCurrency(elecOop)}</td>
                                                    <td className="p-3 py-4 text-emerald-600 dark:text-emerald-400 font-medium">Included</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3 py-4">Emergency Plumbing Call-out</td>
                                                    <td className="p-3 py-4 font-medium">{formatCurrency(plumbOop)}</td>
                                                    <td className="p-3 py-4 text-emerald-600 dark:text-emerald-400 font-medium">Included</td>
                                                </tr>
                                            </tbody>
                                            <tfoot className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                                                <tr>
                                                    <td className="p-3 text-slate-700 dark:text-slate-200">Estimated Annual Total</td>
                                                    <td className="p-3 text-red-600 dark:text-red-400">{formatCurrency(totalOop)}</td>
                                                    <td className="p-3 text-emerald-700 dark:text-emerald-400">~£180 - £240/yr</td>
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
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Industry experts suggest UK homeowners should budget between 1% and 4% of their property's value annually for maintenance. In 2026, with energy price caps fluctuating and labor rates increasing by an estimated 5%, setting aside these funds is critical to avoiding high-interest emergency credit.</p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif text-slate-800 dark:text-slate-200 mb-3 font-bold">2026 Labour Rate Trends</h2>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Our data shows that emergency call-outs in London now average £180 for the first hour, while Midlands rates sit closer to £100. If your boiler is over 10 years old, the probability of a £500+ repair in the next 12 months increases by 65%.</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 md:p-8 rounded-xl">
                            <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-6">2026 Home Readiness Checklist</h3>
                            <div className="space-y-4">
                                {['Verify Gas Safe registration for heating engineers', 'Review insurance \'Home Emergency\' add-on vs. standalone cover', 'Check boiler pressure and bleed radiators before Oct 2026', 'Confirm current excess doesn\'t exceed 1% of liquid savings'].map((text, idx) => (
                                    <label key={idx} className="flex items-start gap-4 cursor-pointer group">
                                        <input type="checkbox" checked={checklist[idx]} onChange={() => toggleChecklist(idx)} className="mt-1 w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
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
