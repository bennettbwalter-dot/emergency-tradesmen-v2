import { Business } from "@/lib/businesses";
import { cn } from "@/lib/utils";
import { GlassSocialIcon } from "@/components/ui/GlassSocialIcon";

interface CardSocialsProps {
    business: Business;
    isParchment?: boolean;
}

export function CardSocials({ business, isParchment }: CardSocialsProps) {
    const { social_links } = business;

    const hasSocials = social_links && Object.values(social_links).some(link => !!link);

    return (
        <div className={`flex items-center justify-center gap-2 mt-3 px-1 min-h-[28px]`}>
            {hasSocials && (
                <>
                    {social_links.facebook && (
                        <GlassSocialIcon
                            platform="facebook"
                            href={social_links.facebook}
                            className={cn("w-7 h-7 rounded-lg", isParchment && "")}
                        />
                    )}
                    {social_links.instagram && (
                        <GlassSocialIcon
                            platform="instagram"
                            href={social_links.instagram}
                            className={cn("w-7 h-7 rounded-lg", isParchment && "")}
                        />
                    )}
                    {social_links.twitter && (
                        <GlassSocialIcon
                            platform="twitter"
                            href={social_links.twitter}
                            className={cn("w-7 h-7 rounded-lg", isParchment && "")}
                        />
                    )}
                    {social_links.linkedin && (
                        <GlassSocialIcon
                            platform="linkedin"
                            href={social_links.linkedin}
                            className={cn("w-7 h-7 rounded-lg", isParchment && "")}
                        />
                    )}
                    {social_links.tiktok && (
                        <GlassSocialIcon
                            platform="tiktok"
                            href={social_links.tiktok}
                            className={cn("w-7 h-7 rounded-lg", isParchment && "")}
                        />
                    )}
                </>
            )}
        </div>
    );
}
