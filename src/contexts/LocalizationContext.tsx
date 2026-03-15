import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
            try {
                const hostname = window.location.hostname;
                const port = window.location.port;
                const isUS = hostname.includes('emergencycontractors.net') || 
                             (hostname === 'localhost' && port === '3001') ||
                             (hostname === '127.0.0.1' && port === '3001');
                
                if (isUS) {
                    setCountryCodeState('US');
                    setHasAttemptedIPDetection(true);
                    return;
                } else if (port === '3000' || hostname.includes('emergencytradesmen.net') || (hostname === 'localhost' && port === '3000')) {
                    setCountryCodeState('GB');
                    setHasAttemptedIPDetection(true);
                    return;
                }

                // Fallback for other domains/IPs (simple check, no redirect)
                const response = await fetch('https://freeipapi.com/api/json');
                const data = await response.json();

                if (data.countryCode === 'US') {
                    setCountryCodeState('US');
                    if (data.regionName) {
                        setDetectedState(data.regionName);
                        console.log(`IP-based state detection: ${data.regionName}`);
                    }
                    if (data.cityName) {
                        setDetectedCity(data.cityName);
                        console.log(`IP-based city detection (US): ${data.cityName}`);
                    }
                } else if (data.countryCode === 'GB') {
                    setCountryCodeState('GB');
                    if (data.cityName) {
                        setDetectedCity(data.cityName);
                        console.log(`IP-based city detection (UK): ${data.cityName}`);
                    }
                } else {
                    setCountryCodeState('GB'); // Default to GB for other regions if not US
                }
            } catch (err) {
                console.warn('IP-based region detection failed:', err);
            } finally {
                setHasAttemptedIPDetection(true);
            }
        };


        detectRegion();
    }, [location.pathname, navigate, hasAttemptedIPDetection]);

    // 2. Real-time Location Tracking (Navigator API)
    const resolveCoordsToCity = useCallback((lat: number, lng: number) => {
        try {
            const nearest = findNearestCity(lat, lng, countryCode);
            if (nearest) {
                setDetectedCity(nearest.city);
                
                // If US, also try to resolve state
                if (countryCode === 'US') {
                    // Import cityToState dynamically or use a ref if circular dependency is an issue
                    // For now we'll assume it's available or we can use a simpler lookup
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

                console.log(`Resolved coords to city: ${nearest.city} (using ${countryCode} coordinates)`);
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

    // Also start watching position if permission is already granted
    useEffect(() => {
        if (!navigator.geolocation) return;

        let lastLat = 0;
        let lastLng = 0;

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Only update if moved more than ~50 meters to prevent jitter/flicker
                const distanceRatio = Math.sqrt(Math.pow(latitude - lastLat, 2) + Math.pow(longitude - lastLng, 2));
                if (distanceRatio < 0.0005) return;

                lastLat = latitude;
                lastLng = longitude;

                setUserCoords({ latitude, longitude });
                // We don't necessarily want to re-resolve city every few seconds
                // unless it exceeds a threshold, but for now simple update is fine
                resolveCoordsToCity(latitude, longitude);
            },
            undefined,
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 }
        );

        return () => navigator.geolocation.clearWatch(watcher);
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
            detectedState: overrideCity ? null : detectedState, // Clear state if city is overridden for now
            isLocating,
            geoError: overrideCoords ? null : geoError,
            detectUserLocation,
            setOverride: (coords, city) => {
                setOverrideCoords(coords);
                setOverrideCity(city);
                
                // If overriding city, also try to update state
                if (city) {
                    import('@/lib/trades').then(({ cityToState }) => {
                        const stateCode = cityToState[city];
                        if (stateCode) {
                            import('@/lib/us_states').then(({ US_STATES }) => {
                                const state = US_STATES.find(s => s.code.toLowerCase() === stateCode.toLowerCase());
                                if (state) setDetectedState(state.name);
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
