import React, { useState, useMemo, useCallback } from 'react';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';

interface TradeData {
    label: string;
    base: number;
    hourly: number;
    isMileage?: boolean;
    response: string;
    nightHourly: number;
}

interface RegionOption {
    value: string;
    label: string;
    multiplier: number;
}

const UK_TRADES: Record<string, TradeData> = {
    'plumber': { label: 'Plumber (Leaks, Bursts, Drainage)', base: 125, hourly: 110, nightHourly: 185, response: '60–90 mins' },
    'electrician': { label: 'Electrician (Power Failure, Wiring)', base: 135, hourly: 125, nightHourly: 210, response: '45–60 mins' },
    'locksmith': { label: 'Locksmith (Lockouts, Security)', base: 110, hourly: 95, nightHourly: 160, response: '30–45 mins' },
    'gas-engineer': { label: 'Gas Engineer (Boiler, Heating, Gas Leak)', base: 180, hourly: 160, nightHourly: 270, response: '60–90 mins' },
    'drain-specialist': { label: 'Drain Specialist (Blocked Drains, CCTV)', base: 140, hourly: 120, nightHourly: 200, response: '60–90 mins' },
    'glazier': { label: 'Glazier (Broken Windows, Glass Repair)', base: 95, hourly: 75, nightHourly: 125, response: '90–120 mins' },
    'roofer': { label: 'Roofer (Roof Leak, Storm Damage)', base: 150, hourly: 85, nightHourly: 145, response: '90–120 mins' },
    'builder': { label: 'Builder (Structural, Walls, Ceiling)', base: 150, hourly: 90, nightHourly: 150, response: '120+ mins' },
    'water-restoration': { label: 'Water Restoration (Flood, Drying)', base: 200, hourly: 145, nightHourly: 245, response: '60–90 mins' },
    'breakdown': { label: 'Breakdown Recovery (Tow, Jump Start)', base: 65, hourly: 2.5, isMileage: true, nightHourly: 4.5, response: '30–60 mins' },
    'hvac': { label: 'Air Conditioning / HVAC (Cooling, Heating)', base: 130, hourly: 100, nightHourly: 170, response: '60–90 mins' },
};

const US_TRADES: Record<string, TradeData> = {
    'plumber': { label: 'Plumber (Leaks, Bursts, Water Heater)', base: 150, hourly: 135, nightHourly: 225, response: '60–90 mins' },
    'electrician': { label: 'Electrician (Power Outage, Panel Upgrade)', base: 165, hourly: 155, nightHourly: 260, response: '45–60 mins' },
    'locksmith': { label: 'Locksmith (Lockouts, Rekeying)', base: 95, hourly: 115, nightHourly: 195, response: '20–45 mins' },
    'hvac-gas': { label: 'HVAC / Gas Engineer (Furnace, Gas Leak)', base: 175, hourly: 165, nightHourly: 280, response: '60–90 mins' },
    'drain-specialist': { label: 'Drain Specialist (Clogged Drains, Sewer)', base: 160, hourly: 145, nightHourly: 240, response: '60–90 mins' },
    'glazier': { label: 'Glazier / Glass Repair (Windows, Storefronts)', base: 120, hourly: 95, nightHourly: 160, response: '90–120 mins' },
    'roofer': { label: 'Roofer / Roof Repair (Leak, Storm Damage)', base: 185, hourly: 110, nightHourly: 185, response: '90–120 mins' },
    'builder': { label: 'Builder / Construction (Structural, Drywall)', base: 175, hourly: 115, nightHourly: 190, response: '120+ mins' },
    'water-restoration': { label: 'Water Damage & Restoration (Flood, Mold)', base: 250, hourly: 175, nightHourly: 295, response: '60–90 mins' },
    'tow': { label: 'Tow Truck / Roadside Assistance', base: 85, hourly: 3.5, isMileage: true, nightHourly: 5.75, response: '30–60 mins' },
    'hvac': { label: 'Heating & Cooling / AC Repair', base: 155, hourly: 125, nightHourly: 210, response: '60–90 mins' },
};

const UK_REGIONS: RegionOption[] = [
    { value: 'national', label: 'UK National Average', multiplier: 1 },
    { value: 'london', label: 'London & South East (+30%)', multiplier: 1.3 },
    { value: 'south', label: 'South West / East Anglia (+10%)', multiplier: 1.1 },
    { value: 'midlands', label: 'Midlands / Wales', multiplier: 1 },
    { value: 'north', label: 'Northern England (−10%)', multiplier: 0.9 },
    { value: 'scotland', label: 'Scotland (−5%)', multiplier: 0.95 },
    { value: 'nireland', label: 'Northern Ireland (−15%)', multiplier: 0.85 },
];

const US_REGIONS: RegionOption[] = [
    { value: 'national', label: 'US National Average', multiplier: 1 },
    { value: 'nyc', label: 'New York City / Tri-State (+35%)', multiplier: 1.35 },
    { value: 'la', label: 'Los Angeles / Bay Area (+30%)', multiplier: 1.3 },
    { value: 'chicago', label: 'Chicago / Great Lakes (+10%)', multiplier: 1.1 },
    { value: 'dallas', label: 'Dallas–Fort Worth / Texas', multiplier: 1 },
    { value: 'south', label: 'Southeast / Deep South (−10%)', multiplier: 0.9 },
    { value: 'midwest', label: 'Midwest / Plains (−15%)', multiplier: 0.85 },
    { value: 'mountain', label: 'Mountain West / Rural (−20%)', multiplier: 0.8 },
];

const TIME_MULTIPLIERS = {
    standard: 1,
    evening: 1.5,
    night: 2.2,
};

const US_TIME_MULTIPLIERS = {
    standard: 1,
    evening: 1.5,
    night: 2.0,
};

interface FairPriceCalculatorProps {
    countryCode: string;
}

export function FairPriceCalculator({ countryCode }: FairPriceCalculatorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const isUK = countryCode === 'GB';
    const currency = isUK ? '£' : '$';
    const trades = isUK ? UK_TRADES : US_TRADES;
    const regions = isUK ? UK_REGIONS : US_REGIONS;
    const timeMuls = isUK ? TIME_MULTIPLIERS : US_TIME_MULTIPLIERS;

    const tradeKeys = Object.keys(trades);
    const [selectedTrade, setSelectedTrade] = useState(tradeKeys[0]);
    const [selectedRegion, setSelectedRegion] = useState('national');
    const [selectedTime, setSelectedTime] = useState<'standard' | 'evening' | 'night'>('standard');
    const [complexity, setComplexity] = useState(1);
    const [miles, setMiles] = useState(10);

    const tradeData = trades[selectedTrade];
    const isMileage = tradeData?.isMileage;

    const regionMul = useMemo(() => {
        return regions.find(r => r.value === selectedRegion)?.multiplier ?? 1;
    }, [selectedRegion, regions]);

    const calculate = useCallback(() => {
        if (!tradeData) return { total: 0, callout: 0, hourlyLabel: `${currency}0`, range: `${currency}0 – ${currency}0` };

        const tMul = timeMuls[selectedTime];
        const callout = Math.round(tradeData.base * regionMul * tMul);

        let total = 0;
        let hourlyLabel = '';

        if (isMileage) {
            const ppm = tradeData.hourly * regionMul * (selectedTime === 'night' ? 1.8 : selectedTime === 'evening' ? 1.3 : 1);
            total = callout + (miles * ppm);
            hourlyLabel = `${currency}${ppm.toFixed(2)} / mile`;
        } else {
            const hr = Math.round(tradeData.hourly * regionMul * tMul);
            total = callout + (hr * (complexity - 0.5));
            hourlyLabel = `${currency}${hr}`;
        }

        const f = Math.round(total);
        return {
            total: f,
            callout,
            hourlyLabel,
            range: `${currency}${Math.round(f * 0.9)} – ${currency}${Math.round(f * 1.15)}`,
        };
    }, [tradeData, regionMul, selectedTime, complexity, miles, isMileage, currency, timeMuls]);

    const result = calculate();

    const timeLabels = isUK
        ? { standard: 'Standard (8am–6pm weekdays)', evening: 'Evening (6pm–10pm)', night: 'Night / Bank Holiday (10pm–8am)' }
        : { standard: 'Standard (8am–6pm weekdays)', evening: 'After-Hours (6pm–10pm)', night: 'Overnight / Federal Holiday (10pm–8am)' };

    return (
        <div className="my-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 rounded-xl font-bold text-base transition-all duration-300"
                style={{
                    background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(230, 126, 34, 0.3)',
                    border: 'none',
                }}
            >
                <span className="flex items-center gap-3">
                    <Calculator className="w-5 h-5" />
                    <span>Fair Price Calculator: Check an Emergency Quote</span>
                </span>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isOpen && (
                <div className="mt-4 rounded-xl border border-border overflow-hidden" style={{ background: 'var(--background, #fff)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Form Side */}
                        <div className="p-6 border-b md:border-b-0 md:border-r border-border">
                            {/* Trade */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold mb-1.5 text-foreground">Service Required</label>
                                <select
                                    value={selectedTrade}
                                    onChange={e => setSelectedTrade(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                >
                                    {tradeKeys.map(k => (
                                        <option key={k} value={k}>{trades[k].label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Region */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold mb-1.5 text-foreground">Your Region</label>
                                <select
                                    value={selectedRegion}
                                    onChange={e => setSelectedRegion(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                >
                                    {regions.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Time */}
                            <div className="mb-5">
                                <label className="block text-sm font-bold mb-1.5 text-foreground">Time of Call</label>
                                <div className="space-y-2">
                                    {(Object.keys(timeLabels) as Array<'standard' | 'evening' | 'night'>).map(t => (
                                        <label
                                            key={t}
                                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${selectedTime === t ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' : 'border-border hover:bg-muted/50'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="calc-time"
                                                checked={selectedTime === t}
                                                onChange={() => setSelectedTime(t)}
                                                className="accent-orange-500"
                                            />
                                            <span className="text-foreground">{timeLabels[t]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Complexity or Mileage */}
                            {isMileage ? (
                                <div className="mb-5">
                                    <label className="block text-sm font-bold mb-1.5 text-foreground">Miles to be Towed</label>
                                    <input
                                        type="number"
                                        value={miles}
                                        onChange={e => setMiles(Math.max(0, parseInt(e.target.value) || 0))}
                                        min={0}
                                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                </div>
                            ) : (
                                <div className="mb-5">
                                    <label className="block text-sm font-bold mb-1.5 text-foreground">Job Complexity</label>
                                    <select
                                        value={complexity}
                                        onChange={e => setComplexity(parseInt(e.target.value))}
                                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    >
                                        <option value={1}>{isUK ? 'Simple (Up to 1 hour)' : 'Minor (Under 1 hour)'}</option>
                                        <option value={2}>Standard (1–2 hours)</option>
                                        <option value={3}>{isUK ? 'Major (3+ hours or multi-person)' : 'Major (3+ hours or crew required)'}</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Results Side */}
                        <div className="p-6 flex flex-col items-center justify-center text-center" style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', color: '#fff' }}>
                            <div className="mb-3">
                                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider" style={{ background: '#e67e22' }}>
                                    Fair Price Estimate
                                </span>
                            </div>
                            <div className="text-5xl font-extrabold mb-4">
                                <span className="text-2xl align-top mr-0.5" style={{ marginTop: '8px', display: 'inline-block' }}>{currency}</span>
                                {result.total.toLocaleString()}
                            </div>
                            <div className="w-full max-w-xs space-y-2 text-sm mb-4">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="opacity-80">{isUK ? 'Estimated Call-out Fee' : 'Estimated Service Call Fee'}</span>
                                    <span className="font-bold">{currency}{result.callout}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="opacity-80">{isMileage ? 'Rate per Mile' : 'Estimated Hourly Rate'}</span>
                                    <span className="font-bold">{result.hourlyLabel}</span>
                                </div>
                                <div className="flex justify-between pt-2" style={{ color: '#e67e22' }}>
                                    <span className="font-bold">Benchmark Range</span>
                                    <span className="font-bold">{result.range}</span>
                                </div>
                            </div>
                            <p className="text-xs opacity-60 italic max-w-xs">
                                {isUK
                                    ? '*Estimates include VAT @ 20% but exclude specialist parts or materials. Based on 2026 BCIS inflation-adjusted benchmarks.'
                                    : '*Estimates exclude sales tax (varies by state), specialist parts, and permits. Based on 2026 BLS and HomeAdvisor data.'}
                            </p>
                        </div>
                    </div>

                    {/* Benchmark Table */}
                    <div className="p-6 border-t border-border">
                        <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 rounded-full bg-orange-500 inline-block"></span>
                            {isUK ? 'Standard Emergency Benchmarks: All 11 Trades (2026 UK)' : 'Standard Emergency Benchmarks: All 11 Trades (2026 US)'}
                        </h4>
                        <div className="overflow-x-auto -mx-2">
                            <table className="min-w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="text-left px-3 py-2 font-semibold text-foreground">Trade</th>
                                        <th className="text-left px-3 py-2 font-semibold text-foreground">{isUK ? 'Call-out Fee' : 'Service Call'}</th>
                                        <th className="text-left px-3 py-2 font-semibold text-foreground">Day Rate</th>
                                        <th className="text-left px-3 py-2 font-semibold text-foreground">Night Rate</th>
                                        <th className="text-left px-3 py-2 font-semibold text-foreground">Response</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tradeKeys.map(k => {
                                        const t = trades[k];
                                        return (
                                            <tr key={k} className="border-t border-border hover:bg-muted/30 transition-colors">
                                                <td className="px-3 py-2 text-foreground font-medium">{t.label.split('(')[0].trim()}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{currency}{t.base}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{currency}{t.hourly}{t.isMileage ? '/mile' : '/hr'}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{currency}{t.nightHourly}{t.isMileage ? '/mile' : '/hr'}</td>
                                                <td className="px-3 py-2 text-muted-foreground">{t.response}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 italic">
                            {isUK
                                ? 'Data: BCIS 2026 Forecasts, Gas Safe Register, MLA, Checkatrade, Federation of Master Builders. All figures include VAT @ 20%.'
                                : 'Data: BLS 2026 Projections, HomeAdvisor, Angi, ALOA, ACCA. Prices exclude state/local sales tax.'}
                        </p>

                        {/* Consumer Rights */}
                        <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-sm">
                            {isUK ? (
                                <>
                                    <p className="font-bold text-foreground mb-1">🛡️ Your Consumer Rights (UK)</p>
                                    <p className="text-muted-foreground">Under the <strong>Consumer Rights Act 2015</strong>, if you do not agree a price upfront, you are only required to pay a "reasonable price." Always request a written quote before work begins.</p>
                                </>
                            ) : (
                                <>
                                    <p className="font-bold text-foreground mb-1">🛡️ Your Consumer Protection (US)</p>
                                    <p className="text-muted-foreground">Under the <strong>FTC Act (Section 5)</strong>, contractors cannot engage in unfair or deceptive practices. Many states require licensed contractors to provide written estimates. Always ask for a license number and proof of insurance.</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
