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
    isLocating: boolean;
    geoError: string | null;
    detectUserLocation: () => void;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode; initialCode?: CountryCode }> = ({
    children,
    initialCode = 'GB'
}) => {
    const [countryCode, setCountryCodeState] = useState<CountryCode>(initialCode);
    const [userCoords, setUserCoords] = useState<Coords | null>(null);
    const [detectedCity, setDetectedCity] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [hasAttemptedIPDetection, setHasAttemptedIPDetection] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // 1. IP-Based Regional Detection (Runs once on mount at root)
    useEffect(() => {
        if (hasAttemptedIPDetection) return;

        const detectRegion = async () => {
            try {
                const response = await fetch('https://freeipapi.com/api/json');
                const data = await response.json();

                if (data.countryCode === 'US' || data.countryCode === 'GB') {
                    const detected = data.countryCode as CountryCode;
                    console.log(`Detected region via IP: ${detected}`);

                    if (location.pathname === '/') {
                        if (detected === 'US') {
                            navigate('/us', { replace: true });
                        }
                    }
                }
            } catch (err) {
                console.warn('IP-based region detection failed:', err);
            } finally {
                setHasAttemptedIPDetection(true);
            }
        };

        if (location.pathname === '/') {
            detectRegion();
        }
    }, [location.pathname, navigate, hasAttemptedIPDetection]);

    // 2. Real-time Location Tracking (Navigator API)
    const resolveCoordsToCity = useCallback((lat: number, lng: number) => {
        try {
            const nearest = findNearestCity(lat, lng);
            if (nearest) {
                setDetectedCity(nearest.city);
                console.log(`Resolved coords to city: ${nearest.city}`);
            }
        } catch (e) {
            console.warn("Failed to resolve city from coords", e);
        }
    }, []);

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

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserCoords({ latitude, longitude });
                // We don't necessarily want to re-resolve city every few seconds
                // unless it exceeds a threshold, but for now simple update is fine
                resolveCoordsToCity(latitude, longitude);
            },
            undefined,
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 300000 }
        );

        return () => navigator.geolocation.clearWatch(watcher);
    }, [resolveCoordsToCity]);

    // 3. URL-Based Context Switching
    useEffect(() => {
        const path = location.pathname;
        const firstSegment = path.split('/')[1]?.toLowerCase();

        if (firstSegment === 'us') {
            setCountryCodeState('US');
        } else if (firstSegment === 'gb') {
            setCountryCodeState('GB');
        } else if (path === '/') {
            setCountryCodeState('GB');
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
            userCoords,
            detectedCity,
            isLocating,
            geoError,
            detectUserLocation
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
