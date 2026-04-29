import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { devLog } from "@/lib/devLog";
import { useLocation, useNavigate } from 'react-router-dom';
import { findNearestCity } from '@/lib/cityCoordinates';

export type CountryCode = 'GB' | 'US';

interface Coords {
    latitude: number;
    longitude: number;
}

interface LocalizationSettings {
    countryCode: CountryCode;
    currencySymbol: string;
    currencyCode: string;
    phonePrefix: string;
    tradeTerm: string; // e.g., "Tradesperson" vs "Contractor"
    cityTerm: string; // e.g., "City" vs "Area"
    towTerm: string; // "Breakdown Recovery" vs "Tow Truck"
    postcodeTerm: string; // "Postcode" vs "Zip Code"
    boilerTerm: string; // "Boiler" vs "HVAC / Water Heater"
    locale: string;
}

const REGIONAL_CONFIG: Record<CountryCode, LocalizationSettings> = {
    GB: {
        countryCode: 'GB',
        currencySymbol: '£',
        currencyCode: 'GBP',
        phonePrefix: '+44',
        tradeTerm: 'Tradesmen',
        cityTerm: 'City',
        towTerm: 'Breakdown Recovery',
        postcodeTerm: 'Postcode',
        boilerTerm: 'Boiler',
        locale: 'en-GB'
    },
    US: {
        countryCode: 'US',
        currencySymbol: '$',
        currencyCode: 'USD',
        phonePrefix: '+1',
        tradeTerm: 'Contractors',
        cityTerm: 'Area',
        towTerm: 'Tow Truck',
        postcodeTerm: 'Zip Code',
        boilerTerm: 'HVAC / Water Heater',
        locale: 'en-US'
    }
};

interface LocalizationContextType {
    settings: LocalizationSettings;
    setCountryCode: (code: CountryCode) => void;
    formatPrice: (amount: number) => string;
    formatPhone: (phone: string) => string;
    userCoords: Coords | null;
    detectedCity: string | null;
    detectedState: string | null;
    isLocating: boolean;
    geoError: string | null;
    detectUserLocation: () => void;
    setOverride: (coords: Coords | null, city: string | null) => void;
    clearOverride: () => void;
    isOverridden: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode; initialCode?: CountryCode }> = ({
    children,
    initialCode = 'GB'
}) => {
    const [countryCode, setCountryCodeState] = useState<CountryCode>(initialCode);
    const [userCoords, setUserCoords] = useState<Coords | null>(null);
    const [detectedCity, setDetectedCity] = useState<string | null>(null);
    const [detectedState, setDetectedState] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [hasAttemptedIPDetection, setHasAttemptedIPDetection] = useState(false);

    // Overrides for Testing
    const [overrideCoords, setOverrideCoords] = useState<Coords | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem('geo_override_coords');
        return saved ? JSON.parse(saved) : null;
    });
    const [overrideCity, setOverrideCity] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('geo_override_city');
    });

    const location = useLocation();
    const navigate = useNavigate();

    // 1. IP-Based Regional Detection (Runs once on mount at root)
    useEffect(() => {
        if (hasAttemptedIPDetection) return;

        const detectRegion = async () => {
            if (hasAttemptedIPDetection) return;

            try {
                const hostname = window.location.hostname;
                const port = window.location.port;
                const isUSDomain = hostname.includes('emergencycontractors.net') || 
                             (hostname === 'localhost' && port === '3001') ||
                             (hostname === '127.0.0.1' && port === '3001');
                const isUKDomain = hostname.includes('emergencytradesmen.net') || 
                             port === '3000' || 
                             (hostname === 'localhost' && port !== '3001') ||
                             (hostname === '127.0.0.1' && port !== '3001');

                const applyIPLocation = async (forcedCountryCode?: CountryCode) => {
                    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
                    if (!response.ok) throw new Error('API unreachable');
                    const data = await response.json();

                    const ipCountryCode = data.country_code || data.countryCode;
                    const regionName = data.region || data.regionName;
                    const cityName = data.city || data.cityName;
                    const latitude = Number(data.latitude);
                    const longitude = Number(data.longitude);
                    const resolvedCountryCode: CountryCode = forcedCountryCode || (ipCountryCode === 'US' ? 'US' : 'GB');

                    if (resolvedCountryCode === 'US') {
                        setCountryCodeState('US');
                        if (ipCountryCode === 'US') {
                            if (regionName) setDetectedState(regionName);
                            if (cityName) setDetectedCity(cityName);
                        }
                        return;
                    }

                    setCountryCodeState('GB');
                    if (ipCountryCode === 'GB') {
                        if (regionName) setDetectedState(regionName);
                        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
                            const nearest = findNearestCity(latitude, longitude, 'GB');
                            if (nearest) setDetectedCity(nearest.city);
                        } else if (cityName) {
                            setDetectedCity(cityName);
                        }
                    }
                };
                
                if (isUSDomain) {
                    setCountryCodeState('US');
                    await applyIPLocation('US');
                } else if (isUKDomain) {
                    setCountryCodeState('GB');
                    await applyIPLocation('GB');
                } else {
                    // Fallback for other domains/IPs
                    await applyIPLocation();
                }
            } catch (err) {
                console.warn('Region detection failed, defaulting to GB:', err);
                setCountryCodeState('GB');
            } finally {
                setHasAttemptedIPDetection(true);
            }
        };


        detectRegion();
    }, [location.pathname, navigate, hasAttemptedIPDetection]);

    // 2. Real-time Location Tracking (Navigator API)
    const resolveCoordsToCity = useCallback(async (lat: number, lng: number) => {
        try {
            const nearest = findNearestCity(lat, lng, countryCode);
            if (nearest) {
                setDetectedCity(nearest.city);

                // If US, also try to resolve state
                if (countryCode === 'US') {
                    import('@/lib/trades').then(({ cityToState }) => {
                        const stateCode = cityToState[nearest.city];
                        if (stateCode) {
                            import('@/lib/us_states').then(({ US_STATES }) => {
                                const state = US_STATES.find(s => s.code.toLowerCase() === stateCode.toLowerCase());
                                if (state) setDetectedState(state.name);
                            });
                        }
                    });
                }

                devLog(`Resolved coords to city: ${nearest.city} (using ${countryCode} coordinates)`);
            } else {
                // No city in database — fall back to Nominatim reverse geocoding (free, no key required)
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const city =
                            data.address?.city ||
                            data.address?.town ||
                            data.address?.village ||
                            data.address?.county ||
                            null;
                        if (city) {
                            setDetectedCity(city);
                            devLog(`Nominatim resolved city: ${city}`);
                        }
                        if (countryCode === 'US' && data.address?.state) {
                            setDetectedState(data.address.state);
                        }
                    }
                } catch (nominatimErr) {
                    console.warn("Nominatim geocode failed:", nominatimErr);
                }
            }
        } catch (e) {
            console.warn("Failed to resolve city from coords", e);
        }
    }, [countryCode]);

    const detectUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserCoords({ latitude, longitude });
                resolveCoordsToCity(latitude, longitude);
                setIsLocating(false);
            },
            (error) => {
                setIsLocating(false);
                setGeoError(error.message);
                console.warn('Geolocation error:', error.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, [resolveCoordsToCity]);

    // 3. URL-Based Context Switching
    useEffect(() => {
        const path = location.pathname;
        const hostname = window.location.hostname;
        const port = window.location.port;

        // Force country based on port/domain
        if (hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001')) {
            setCountryCodeState('US');
        } else if (hostname.includes('emergencytradesmen.net') || port === '3000' || (hostname === 'localhost' && port === '3000')) {
            setCountryCodeState('GB');
        } else {
            // Path-based fallback for multi-tenant dev
            const firstSegment = path.split('/')[1]?.toLowerCase();
            if (firstSegment === 'us' || firstSegment === 'usa') {
                setCountryCodeState('US');
            } else {
                setCountryCodeState('GB');
            }
        }
    }, [location.pathname]);

    const setCountryCode = (code: CountryCode) => {
        if (REGIONAL_CONFIG[code]) {
            setCountryCodeState(code);
        }
    };

    const settings = REGIONAL_CONFIG[countryCode];

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat(settings.locale, {
            style: 'currency',
            currency: settings.currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPhone = (phone: string) => {
        return phone;
    };

    return (
        <LocalizationContext.Provider value={{
            settings,
            setCountryCode,
            formatPrice,
            formatPhone,
            userCoords: overrideCoords || userCoords,
            detectedCity: overrideCity || detectedCity,
            detectedState, 
            isLocating,
            geoError: overrideCoords ? null : geoError,
            detectUserLocation,
            setOverride: (coords, city) => {
                setOverrideCoords(coords);
                setOverrideCity(city);
                
                // If overriding city, also try to update state
                if (city && countryCode === 'US') {
                    import('@/lib/trades').then(({ cityToState }) => {
                        const stateCode = cityToState[city];
                        if (stateCode) {
                            import('@/lib/us_states').then(({ US_STATES }) => {
                                const state = US_STATES.find(s => s.code.toLowerCase() === stateCode.toLowerCase());
                                if (state) {
                                    setDetectedState(state.name);
                                    devLog(`Overriding state to: ${state.name} based on city: ${city}`);
                                }
                            });
                        }
                    });
                }
                if (coords) localStorage.setItem('geo_override_coords', JSON.stringify(coords));
                else localStorage.removeItem('geo_override_coords');
                if (city) localStorage.setItem('geo_override_city', city);
                else localStorage.removeItem('geo_override_city');
            },
            clearOverride: () => {
                setOverrideCoords(null);
                setOverrideCity(null);
                localStorage.removeItem('geo_override_coords');
                localStorage.removeItem('geo_override_city');
            },
            isOverridden: !!overrideCoords || !!overrideCity
        }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
