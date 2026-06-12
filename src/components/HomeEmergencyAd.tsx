import { useLocalization } from "@/contexts/LocalizationContext";
import { HomeEmergencyAdUK } from "./HomeEmergencyAdUK";
import { HomeEmergencyAdUS } from "./HomeEmergencyAdUS";

export function HomeEmergencyAd() {
    const { settings } = useLocalization();

    if (settings.countryCode === 'US') {
        // Renders nothing until a real US affiliate URL is configured
        return <HomeEmergencyAdUS />;
    }

    // Default to UK for GB or any other unhandled regions currently
    return <HomeEmergencyAdUK />;
}
