import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { devLog } from '@/lib/devLog';
import { useLocation } from 'react-router-dom';
import { findNearestCity } from '@/lib/cityCoordinates';
import { getSiteCountryCode } from '@/lib/siteConfig';

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
    tradeTerm: string;
    cityTerm: string;
    towTerm: string;
    postcodeTerm: string;
    boilerTerm: string;
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

const REVERSE_GEOCODE_TIMEOUT_MS = 2500;
const GEOLOCATION_TIMEOUT_MS = 15000;
const GEOLOCATION_MAX_AGE_MS = 60_000;

const UK_BOUNDS = { minLat: 49.8, maxLat: 60.9, minLng: -8.8, maxLng: 2.1 };
const US_BOUNDS = { minLat: 24.3, maxLat: 49.5, minLng: -125, maxLng: -66.8 };

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
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode; initialCode?: CountryCode }> = ({
    children,
    initialCode = 'GB'
}) => {
    const [countryCode, setCountryCodeState] = useState<CountryCode>(() => getLockedSiteCountry(initialCode));
    const [userCoords, setUserCoords] = useState<Coords | null>(null);
    const [detectedCity, setDetectedCity] = useState<string | null>(null);
    const [detectedState, setDetectedState] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const lastLiveFixRef = useRef<{ coords: Coords; timestamp: number } | null>(null);
    const lastReverseLookupAtRef = useRef(0);
    const location = useLocation();

    useEffect(() => {
        setCountryCodeState(getLockedSiteCountry(initialCode));
    }, [location.pathname, initialCode]);

    const resolveCoordsToCity = useCallback(async (lat: number, lng: number): Promise<boolean> => {
        const siteCountry = getLockedSiteCountry(initialCode);
        setCountryCodeState(siteCountry);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            setDetectedCity(null);
            setDetectedState(null);
            setGeoError('Your browser returned an invalid location. Type your town, city, postcode, or ZIP code manually.');
            return false;
        }

        if (!coordsWithinCountry(lat, lng, siteCountry)) {
            setDetectedCity(null);
            setDetectedState(null);
            setGeoError(siteCountry === 'GB'
                ? 'This site only covers UK locations. Type a UK town, city, or postcode manually.'
                : 'This site only covers USA locations. Type a US city, area, or ZIP code manually.');
            return false;
        }

        try {
            const reverseCity = await reverseGeocodeArea(lat, lng, siteCountry);
            const nearest = findNearestCity(lat, lng, siteCountry);
            const resolvedCity = reverseCity || nearest?.city || null;

            if (!resolvedCity) {
                setGeoError('Unable to identify your nearest area. Type your town, city, postcode, or ZIP code manually.');
                return false;
            }

            setDetectedCity(resolvedCity);
            setGeoError(null);

            if (siteCountry === 'US') {
                resolveUSState(resolvedCity, nearest?.city || null, setDetectedState);
            } else {
                setDetectedState(null);
            }

            devLog(`Resolved coords to area: ${resolvedCity} (locked to ${siteCountry} site)`);
            return true;
        } catch (error) {
            console.warn('Failed to resolve area from coords', error);
            setGeoError('Unable to identify your nearest area. Type your town, city, postcode, or ZIP code manually.');
            return false;
        }
    }, [initialCode]);

    const detectUserLocation = useCallback(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setGeoError('Your browser does not support location. Type your town, city, postcode, or ZIP code manually.');
            return;
        }

        if (typeof window !== 'undefined' && !window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
            setGeoError('Location needs a secure HTTPS connection. Type your town, city, postcode, or ZIP code manually.');
            return;
        }

        setIsLocating(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                    setIsLocating(false);
                    setDetectedCity(null);
                    setDetectedState(null);
                    setGeoError('Your browser returned an invalid location. Type your town, city, postcode, or ZIP code manually.');
                    return;
                }

                const coords = { latitude, longitude };
                lastLiveFixRef.current = { coords, timestamp: Date.now() };
                lastReverseLookupAtRef.current = Date.now();
                setUserCoords(coords);

                try {
                    await resolveCoordsToCity(latitude, longitude);
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setIsLocating(false);
                setGeoError(getGeolocationErrorMessage(error));
                if (error.code !== error.PERMISSION_DENIED) {
                    console.warn('Geolocation error:', error.message);
                }
            },
            { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAX_AGE_MS }
        );
    }, [resolveCoordsToCity]);

    const setCountryCode = (code: CountryCode) => {
        const lockedCountry = getLockedSiteCountry(initialCode);
        if (code === lockedCountry) setCountryCodeState(code);
    };

    const settings = REGIONAL_CONFIG[countryCode];
    return (
        <LocalizationContext.Provider value={{
            settings,
            setCountryCode,
            formatPrice: (amount) => new Intl.NumberFormat(settings.locale, {
                style: 'currency',
                currency: settings.currencyCode,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount),
            formatPhone: (phone) => phone,
            userCoords,
            detectedCity,
            detectedState,
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

function getLockedSiteCountry(fallback: CountryCode): CountryCode {
    if (typeof window === 'undefined') return fallback;
    if (import.meta.env.MODE === 'us') return 'US';
    if (import.meta.env.MODE === 'uk') return 'GB';
    return getSiteCountryCode();
}

function coordsWithinCountry(lat: number, lng: number, countryCode: CountryCode): boolean {
    const bounds = countryCode === 'US' ? US_BOUNDS : UK_BOUNDS;
    return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location access was blocked. Type your town, city, postcode, or ZIP code manually.';
        case error.POSITION_UNAVAILABLE:
            return 'Your device could not provide a location. Check location services or type your area manually.';
        case error.TIMEOUT:
            return 'Location took too long to load. Try Locate Me again or type your area manually.';
        default:
            return 'Unable to find your location right now. Type your town, city, postcode, or ZIP code manually.';
    }
}

async function reverseGeocodeArea(lat: number, lng: number, countryCode: CountryCode): Promise<string | null> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REVERSE_GEOCODE_TIMEOUT_MS);
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=14`,
            { headers: { 'Accept-Language': 'en' }, signal: controller.signal }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const reverseCountry = String(data.address?.country_code || '').toUpperCase();
        if (reverseCountry && reverseCountry !== countryCode) return null;

        return normalizeAreaName(
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.borough ||
            data.address?.municipality ||
            data.address?.suburb ||
            data.address?.city_district ||
            data.address?.neighbourhood ||
            data.address?.county ||
            null
        );
    } catch (error) {
        console.warn('Nominatim geocode failed:', error);
        return null;
    } finally {
        window.clearTimeout(timeoutId);
    }
}

function normalizeAreaName(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 1 ? trimmed : null;
}

function resolveUSState(city: string, fallbackCity: string | null, setDetectedState: (state: string | null) => void) {
    import('@/lib/trades').then(({ cityToState }) => {
        const stateCode = cityToState[city] || (fallbackCity ? cityToState[fallbackCity] : null);
        if (!stateCode) return;
        import('@/lib/us_states').then(({ US_STATES }) => {
            const state = US_STATES.find(s => s.code.toLowerCase() === stateCode.toLowerCase());
            if (state) setDetectedState(state.name);
        });
    });
}
