import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type CountryCode = 'GB' | 'US';

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
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode; initialCode?: CountryCode }> = ({
    children,
    initialCode = 'GB'
}) => {
    const [countryCode, setCountryCodeState] = useState<CountryCode>(initialCode);
    const location = useLocation();

    // Auto-detect from URL Path (e.g., /us/...)
    useEffect(() => {
        const path = location.pathname;
        const firstSegment = path.split('/')[1]?.toLowerCase();

        if (firstSegment === 'us') {
            setCountryCodeState('US');
        } else if (firstSegment === 'gb') {
            setCountryCodeState('GB');
        } else if (firstSegment && firstSegment !== '') {
            // If it's something else (like /emergency-plumber), we assume GB (UK)
            setCountryCodeState('GB');
        } else {
            // Root (/)
            setCountryCodeState('GB');
        }
    }, [location]);

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
        // Basic formatting, can be expanded
        return phone;
    };

    return (
        <LocalizationContext.Provider value={{ settings, setCountryCode, formatPrice, formatPhone }}>
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
