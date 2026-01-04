import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trades, cities, usCities } from "@/lib/trades";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";

const cityToState: Record<string, string> = {
    // California
    "Los Angeles": "ca", "San Diego": "ca", "San Francisco": "ca", "Sacramento": "ca",
    // Texas
    "Dallas": "tx", "Houston": "tx", "Austin": "tx", "San Antonio": "tx", "Arlington": "tx", "Frisco": "tx", "Irving": "tx", "Plano": "tx", "Fort Worth": "tx",
    // Florida
    "Miami": "fl", "Orlando": "fl", "Jacksonville": "fl", "Tampa": "fl",
    // Arizona
    "Phoenix": "az", "Tucson": "az", "Mesa": "az", "Scottsdale": "az",
    // Washington
    "Seattle": "wa", "Spokane": "wa", "Tacoma": "wa",
    // Others
    "Buffalo": "ny", "Cleveland": "oh", "Detroit": "mi", "Pittsburgh": "pa", "Portland": "or"
};

export default function LocationsDirectory() {
    const { settings } = useLocalization();
    const isUS = settings.countryCode === 'US';
    const targetCities = isUS ? usCities : cities;
    const countryPrefix = isUS ? '/us' : '';

    // Group cities by first letter for better organization
    const groupedCities: Record<string, string[]> = {};

    [...targetCities].sort().forEach(city => {
        const letter = city[0].toUpperCase();
        if (!groupedCities[letter]) groupedCities[letter] = [];
        groupedCities[letter].push(city);
    });

    const alphabet = Object.keys(groupedCities).sort();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO
                title={`Service Locations Directory | Emergency Tradesmen ${isUS ? 'US' : 'UK'}`}
                description={`Browse our full list of service areas across the ${isUS ? 'USA' : 'UK'}. Find emergency 24/7 plumbers, electricians, locksmiths and more in your local city.`}
            />

            <Header />

            <main className="flex-1 container-wide py-12 md:py-20">
                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
                        Service <span className="text-gold">Locations</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        We provide 24/7 emergency coverage across major {isUS ? 'US' : 'UK'} cities and surrounding areas.
                        Select your location to find verified tradesmen near you.
                    </p>
                </div>

                {/* Quick Links to Letters */}
                <div className="flex flex-wrap justify-center gap-2 mb-16">
                    {alphabet.map(letter => (
                        <a
                            key={letter}
                            href={`#section-${letter}`}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-card border border-border/50 text-sm font-medium text-muted-foreground hover:bg-gold hover:text-white hover:border-gold transition-colors"
                        >
                            {letter}
                        </a>
                    ))}
                </div>

                <div className="space-y-16">
                    {alphabet.map(letter => (
                        <div key={letter} id={`section-${letter}`} className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold/10 text-gold font-display text-2xl border border-gold/20">
                                    {letter}
                                </span>
                                <div className="h-px flex-1 bg-border/50" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupedCities[letter].map(city => {
                                    const state = cityToState[city] || 'us';

                                    return (
                                        <div
                                            key={city}
                                            className="group bg-card rounded-xl border border-border/50 p-6 hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-3 mb-4">
                                                <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                                                <h3 className="font-display text-xl text-foreground group-hover:text-gold transition-colors">
                                                    {city}
                                                </h3>
                                            </div>

                                            <ul className="space-y-2">
                                                {trades.map(trade => (
                                                    <li key={`${city}-${trade.slug}`}>
                                                        <Link
                                                            to={isUS
                                                                ? `/us/${state}/${city.toLowerCase().replace(/ /g, '-')}/${trade.slug}`
                                                                : `/emergency-${trade.slug}/${city.toLowerCase().replace(/ /g, '-')}`
                                                            }
                                                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors py-1"
                                                        >
                                                            <span className="w-1 h-1 rounded-full bg-gold/50" />
                                                            Emergency {isUS ? (trade as any).usName : trade.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
