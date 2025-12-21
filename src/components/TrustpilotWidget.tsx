import React, { useEffect, useRef } from 'react';

interface TrustpilotWidgetProps {
    templateId: string;
    businessId: string;
    username: string;
    styleHeight?: string;
    styleWidth?: string;
    theme?: 'light' | 'dark';
    stars?: string;
    className?: string;
}

const TrustpilotWidget: React.FC<TrustpilotWidgetProps> = ({
    templateId,
    businessId,
    username,
    styleHeight = '52px',
    styleWidth = '100%',
    theme = 'light',
    stars = '5',
    className = '',
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if Trustpilot is loaded
        if (window.Trustpilot) {
            window.Trustpilot.loadFromElement(ref.current);
        }
    }, []);

    return (
        <div
            ref={ref}
            className={`trustpilot-widget ${className}`}
            data-locale="en-GB"
            data-template-id={templateId}
            data-businessunit-id={businessId}
            data-style-height={styleHeight}
            data-style-width={styleWidth}
            data-theme={theme}
            data-stars={stars}
            data-sku={username}
        >
            <a href={`https://uk.trustpilot.com/review/${username}`} target="_blank" rel="noopener noreferrer">
                Trustpilot
            </a>
        </div>
    );
};

export default TrustpilotWidget;

// Add Trustpilot to window interface
declare global {
    interface Window {
        Trustpilot: any;
    }
}
