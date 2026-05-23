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

const LIVE_LOCATION_MIN_DISTANCE_METERS = 650;
const LIVE_LOCATION_MAX_STALE_MS = 90_000;
const LIVE_LOCATION_REFRESH_THROTTLE_MS = 8_000;
const MAX_ACCEPTED_ACCURACY_METERS = 2500;
const MAX_POSITION_AGE_MS = 60_000;
const REVERSE_GEOCODE_TIMEOUT_MS = 2500;

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
    const watchIdRef = useRef<number | null>(null);
    const location = useLocation();

    useEffect(() => {
        setCountryCodeState(getLockedSiteCountry(initialCode));
    }, [location.pathname, initialCode]);

    const resolveCoordsToCity = useCallback(async (lat: number, lng: number) => {
        const siteCountry = getLockedSiteCountry(initialCode);
        setCountryCodeState(siteCountry);

        if (!coordsWithinCountry(lat, lng, siteCountry)) {
            setDetectedCity(null);
            if (siteCountry === 'GB') setDetectedState(null);
            setGeoError(siteCountry === 'GB'
                ? 'This site only covers UK locations. Choose a UK area manually if needed.'
                : 'This site only covers USA locations. Choose a US area manually if needed.');
            return;
        }

        try {
            const reverseCity = await reverseGeocodeArea(lat, lng, siteCountry);
            const nearest = findNearestCity(lat, lng, siteCountry);
            const resolvedCity = reverseCity || nearest?.city || null;

            if (!resolvedCity) {
                setGeoError('Unable to identify your nearest area. Choose your area manually if needed.');
                return;
            }

            setDetectedCity(resolvedCity);
            setGeoError(null);

            if (siteCountry === 'US') {
                resolveUSState(resolvedCity, nearest?.city || null, setDetectedState);
            } else {
                setDetectedState(null);
            }

            devLog(`Resolved coords to area: ${resolvedCity} (locked to ${siteCountry} site)`);
        } catch (error) {
            console.warn('Failed to resolve area from coords', error);
            setGeoError('Unable to identify your nearest area. Choose your area manually if needed.');
        }
    }, [initialCode]);

    const detectUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser. Choose your area manually.');
            return;
        }

        setIsLocating(true);
        setGeoError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                if (!isUsablePhonePosition(position)) {
                    setDetectedCity(null);
                    setIsLocating(false);
                    setGeoError(getAccuracyMessage(accuracy));
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
                setGeoError(error.code === error.PERMISSION_DENIED
                    ? 'Location access is blocked. Choose your area manually to see local results.'
                    : 'Unable to refresh your location right now. Choose your area manually if needed.');
                if (error.code !== error.PERMISSION_DENIED) {
                    console.warn('Geolocation error:', error.message);
                }
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, [resolveCoordsToCity]);

    useEffect(() => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser. Choose your area manually.');
            return;
        }
        if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
            setGeoError('Location needs HTTPS. Choose your area manually.');
            return;
        }

        detectUserLocation();

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
                if (!isUsablePhonePosition(position)) {
                    setUserCoords(null);
                    setDetectedCity(null);
                    setGeoError(getAccuracyMessage(accuracy));
                    return;
                }

                const coords = { latitude, longitude };
                const previous = lastLiveFixRef.current;
                const movedMeters = previous ? distanceMeters(previous.coords, coords) : Infinity;
                const staleMs = previous ? Date.now() - previous.timestamp : Infinity;
                const minMove = Math.max(LIVE_LOCATION_MIN_DISTANCE_METERS, Number.isFinite(accuracy) ? accuracy * 1.25 : 0);

                setUserCoords(coords);

                if (previous && movedMeters < minMove && staleMs < LIVE_LOCATION_MAX_STALE_MS) {
                    return;
                }

                const now = Date.now();
                if (previous && now - lastReverseLookupAtRef.current < LIVE_LOCATION_REFRESH_THROTTLE_MS) {
                    return;
                }

                lastLiveFixRef.current = { coords, timestamp: now };
                lastReverseLookupAtRef.current = now;
                resolveCoordsToCity(latitude, longitude);
            },
            (error) => {
                setGeoError(error.code === error.PERMISSION_DENIED
                    ? 'Location access is blocked. Choose your area manually to see local results.'
                    : 'Unable to refresh your location right now. Choose your area manually if needed.');
                setIsLocating(false);
                if (error.code !== error.PERMISSION_DENIED) {
                    console.warn('Geolocation error:', error.message);
                }
            },
            { enableHighAccuracy: true, timeout: 18000, maximumAge: 12000 }
        );

        const refreshOnVisible = () => {
            if (document.visibilityState === 'visible') detectUserLocation();
        };
        document.addEventListener('visibilitychange', refreshOnVisible);

        return () => {
            document.removeEventListener('visibilitychange', refreshOnVisible);
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [detectUserLocation, resolveCoordsToCity]);

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

function isUsablePhonePosition(position: GeolocationPosition): boolean {
    const accuracy = position.coords.accuracy;
    const age = Date.now() - position.timestamp;
    const accurateEnough = !Number.isFinite(accuracy) || accuracy <= MAX_ACCEPTED_ACCURACY_METERS;
    const freshEnough = !Number.isFinite(age) || age <= MAX_POSITION_AGE_MS;
    return accurateEnough && freshEnough;
}

function getAccuracyMessage(accuracy: number | null | undefined): string {
    if (Number.isFinite(accuracy) && Number(accuracy) > MAX_ACCEPTED_ACCURACY_METERS) {
        return 'Your phone only provided an approximate network location. Turn on precise location/GPS or choose your area manually.';
    }

    return 'Your phone location is stale or unavailable. Refresh location or choose your area manually.';
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

function distanceMeters(a: Coords, b: Coords): number {
    const radiusMeters = 6371008.8;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const deltaLat = toRad(b.latitude - a.latitude);
    const deltaLng = toRad(b.longitude - a.longitude);
    const h =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return 2 * radiusMeters * Math.asin(Math.sqrt(h));
}
