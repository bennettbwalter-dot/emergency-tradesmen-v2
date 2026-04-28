import { useLocalization } from "@/contexts/LocalizationContext";
import { HomeEmergencyAdUK } from "./HomeEmergencyAdUK";

export function HomeEmergencyAd() {
    const { settings } = useLocalization();

    if (settings.countryCode === 'US') {
        return null;
    }

    // Default to UK for GB or any other unhandled regions currently
    return <HomeEmergencyAdUK />;
}
