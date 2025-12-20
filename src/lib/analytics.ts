import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
    if (MEASUREMENT_ID) {
        ReactGA.initialize(MEASUREMENT_ID);
        console.log("GA initialized with ID:", MEASUREMENT_ID);
    } else {
        console.warn("GA Measurement ID missing in .env");
    }
};

export const trackPageView = (path: string) => {
    if (!MEASUREMENT_ID) return;
    ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category: string, action: string, label?: string) => {
    if (!MEASUREMENT_ID) {
        console.log(`[Dev Analytics] ${category} - ${action} ${label ? `(${label})` : ""}`);
        return;
    }
    ReactGA.event({
        category,
        action,
        label,
    });
};
