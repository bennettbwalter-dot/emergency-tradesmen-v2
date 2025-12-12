import { useEffect } from 'react';

const TAWK_PROPERTY_ID = '6758414949e2fd8dfef5d9d7'; // Example/Demo ID or Place your own
const TAWK_WIDGET_ID = '1iet0p000'; // Example/Demo ID

export function LiveChat() {
    // Tawk.to integration disabled - invalid credentials
    // To enable: configure valid TAWK_PROPERTY_ID and TAWK_WIDGET_ID
    /*
    useEffect(() => {
        if (!TAWK_PROPERTY_ID || !TAWK_WIDGET_ID) return;

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        document.body.appendChild(script);

        return () => {
            // Cleanup if needed, though Tawk.to is global
            try {
                document.body.removeChild(script);
            } catch (e) {
                // ignore
            }
        };
    }, []);
    */

    return null;
}
